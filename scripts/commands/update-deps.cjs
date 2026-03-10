#!/usr/bin/env node
/**
 * Обновляет scripts/deps.json до последних версий пакетов из npm registry.
 * Поддерживает несколько приватных реестров (add-enterprise).
 * Для приватных пакетов требуется NPM_TOKEN (добавляется через add-enterprise).
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawnSync } = require("child_process");
const os = require("os");

const { getRegistries } = require("../lib/env.cjs");
const { exitWithError } = require("../lib/cli.cjs");

const DEPS_PATH = path.resolve(__dirname, "..", "deps.json");

const HELP = `
  Обновление версий в scripts/deps.json

  Использование:
    pnpm update-enterprise

  Подтягивает последние версии из npm registry, проверяет через pnpm audit (High/Critical).
  В deps.json попадают только версии, прошедшие audit. Для приватных пакетов нужен NPM_TOKEN.
`;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

function loadDeps() {
  if (!fs.existsSync(DEPS_PATH)) {
    exitWithError(
      `Файл deps.json не найден: ${DEPS_PATH}. Запусти скрипт из корня preset.`
    );
  }
  try {
    const data = JSON.parse(fs.readFileSync(DEPS_PATH, "utf-8"));
    if (typeof data !== "object" || data === null) {
      exitWithError("deps.json должен содержать объект.");
    }
    return data;
  } catch (err) {
    exitWithError(
      `Не удалось прочитать deps.json: ${err.message}. Проверь формат JSON.`
    );
  }
}
const NPM_REGISTRY = "https://registry.npmjs.org";

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: { "User-Agent": "enterprise-rsbuild-preset/1.0", ...headers },
    };
    https
      .get(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Invalid JSON from ${url}`));
          }
        });
      })
      .on("error", reject);
  });
}

function getRegistryForScope(scope) {
  const registries = getRegistries();
  return registries[scope]?.replace(/\/$/, "") || null;
}

async function getLatestVersion(packageName, registry) {
  const encoded = encodeURIComponent(packageName);
  const url = `${registry}/${encoded}`;

  const headers = {};
  if (registry !== NPM_REGISTRY && process.env.NPM_TOKEN) {
    headers.Authorization = `Bearer ${process.env.NPM_TOKEN}`;
  }

  try {
    const data = await fetchJson(url, headers);
    const version = data["dist-tags"]?.latest ?? data.version;
    return version ? `^${version}` : null;
  } catch {
    return null;
  }
}

function getAllPackages(deps) {
  const fromDeps = [
    ...Object.keys(deps.dependencies || {}),
    ...Object.keys(deps.devDependencies || {}),
  ];
  const privateDeps = deps.privateDependencies || {};
  const registries = getRegistries();
  const scopes = Object.keys(registries);
  const scopeForShortNames = scopes.length === 1 ? scopes[0] : null;

  const expanded = [];
  for (const name of Object.keys(privateDeps)) {
    const fullName = name.startsWith("@")
      ? name
      : scopeForShortNames
        ? `${scopeForShortNames}/${name}`
        : null;
    if (fullName) expanded.push(fullName);
  }
  return [...fromDeps, ...expanded];
}

function runAuditVerification(deps) {
  const tempDir = path.join(os.tmpdir(), `enterprise-audit-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const pkg = {
    name: "audit-check",
    version: "1.0.0",
    private: true,
    dependencies: deps.dependencies || {},
    devDependencies: deps.devDependencies || {},
  };
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify(pkg, null, 2),
    "utf-8"
  );

  const { buildNpmrc } = require("../templates/scope.cjs");
  const npmrc = buildNpmrc();
  if (npmrc && !npmrc.startsWith("#")) {
    fs.writeFileSync(path.join(tempDir, ".npmrc"), npmrc, "utf-8");
  }

  const env = { ...process.env };
  const installResult = spawnSync("pnpm", ["install", "--no-frozen-lockfile"], {
    cwd: tempDir,
    env,
    stdio: "pipe",
  });

  if (installResult.status !== 0) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    return { ok: false, error: "pnpm install не удался", output: installResult.stderr?.toString() || installResult.stdout?.toString() };
  }

  const auditResult = spawnSync("pnpm", ["audit", "--audit-level=high"], {
    cwd: tempDir,
    env,
    stdio: "pipe",
  });

  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  if (auditResult.status !== 0) {
    return {
      ok: false,
      error: "Обнаружены уязвимости (High/Critical)",
      output: auditResult.stdout?.toString() || auditResult.stderr?.toString() || "",
    };
  }
  return { ok: true };
}

async function main() {
  const deps = loadDeps();
  const packages = getAllPackages(deps);
  const hasPrivate = packages.some((p) => p.startsWith("@"));
  const envPath = path.resolve(__dirname, "..", "..", ".env");
  if (hasPrivate && !process.env.NPM_TOKEN && fs.existsSync(envPath)) {
    console.log(
      "\n⚠ Для приватных пакетов нужен NPM_TOKEN. Добавь в .env или задай в окружении.\n"
    );
  }
  const total = packages.length;
  let updated = 0;
  const failed = [];

  console.log(`\nОбновление версий ${total} пакетов...\n`);

  for (const name of packages) {
    const isScoped = name.startsWith("@");
    const scope = isScoped ? name.split("/")[0] : null;
    const registry =
      isScoped && getRegistryForScope(scope)
        ? getRegistryForScope(scope)
        : NPM_REGISTRY;

    const version = await getLatestVersion(name, registry);
    if (version) {
      let oldVersion = "";
      if (deps.dependencies?.[name]) {
        oldVersion = deps.dependencies[name];
        deps.dependencies[name] = version;
        updated++;
      } else if (deps.devDependencies?.[name]) {
        oldVersion = deps.devDependencies[name];
        deps.devDependencies[name] = version;
        updated++;
      } else if (deps.privateDependencies?.[name]) {
        oldVersion = deps.privateDependencies[name];
        deps.privateDependencies[name] = version;
        updated++;
      } else if (
        scope &&
        deps.privateDependencies?.[name.replace(`${scope}/`, "")]
      ) {
        oldVersion = deps.privateDependencies[name.replace(`${scope}/`, "")];
        deps.privateDependencies[name.replace(`${scope}/`, "")] = version;
        updated++;
      }
      const fromTo = oldVersion ? ` ${oldVersion} → ${version}` : ` ${version}`;
      process.stdout.write(`  ✓ ${name}${fromTo}\n`);
    } else {
      failed.push(name);
      process.stdout.write(`  ✗ ${name} (не удалось получить версию)\n`);
    }
  }

  console.log(`\nПроверка audit (High/Critical)...`);
  const auditResult = runAuditVerification(deps);
  if (!auditResult.ok) {
    console.log(`\n❌ Audit не пройден: ${auditResult.error}`);
    if (auditResult.output) {
      console.log(auditResult.output.trim().slice(0, 500));
    }
    console.log(`\nОбновления не применены. Исправь уязвимости и повтори.`);
    process.exit(1);
  }
  console.log(`  ✓ Audit пройден`);

  fs.writeFileSync(DEPS_PATH, JSON.stringify(deps, null, 2) + "\n", "utf-8");

  console.log(`\nОбновлено: ${updated} пакетов`);
  if (failed.length > 0) {
    const privateScopes = [
      ...new Set(
        failed.filter((p) => p.startsWith("@")).map((p) => p.split("/")[0])
      ),
    ];
    const hint = privateScopes.length
      ? ` (проверь NPM_TOKEN и add-enterprise для ${privateScopes.join(", ")})`
      : "";
    console.log(`\nНе обновлены${hint}: ${failed.join(", ")}`);
  }
  console.log("");
}

main().catch((err) => {
  exitWithError(err.message || String(err));
});
