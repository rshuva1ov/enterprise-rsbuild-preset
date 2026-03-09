#!/usr/bin/env node
/**
 * Обновляет scripts/deps.json до последних версий пакетов из npm registry.
 * Поддерживает несколько приватных реестров (add-registry, .env).
 * Для приватных пакетов требуется NPM_TOKEN в .env.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const { PRIVATE_SCOPE, getRegistries } = require("../lib/env.cjs");
const { exitWithError } = require("../lib/cli.cjs");

const DEPS_PATH = path.resolve(__dirname, "..", "deps.json");

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
  const scopeForShortNames =
    PRIVATE_SCOPE || (scopes.length === 1 ? scopes[0] : null);

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
  const registries = getRegistries();
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
      if (deps.dependencies?.[name]) {
        deps.dependencies[name] = version;
        updated++;
      } else if (deps.devDependencies?.[name]) {
        deps.devDependencies[name] = version;
        updated++;
      } else if (deps.privateDependencies?.[name]) {
        deps.privateDependencies[name] = version;
        updated++;
      } else if (
        scope &&
        deps.privateDependencies?.[name.replace(`${scope}/`, "")]
      ) {
        deps.privateDependencies[name.replace(`${scope}/`, "")] = version;
        updated++;
      }
      process.stdout.write(`  ✓ ${name} → ${version}\n`);
    } else {
      failed.push(name);
      process.stdout.write(`  ✗ ${name} (не удалось получить версию)\n`);
    }
  }

  fs.writeFileSync(DEPS_PATH, JSON.stringify(deps, null, 2) + "\n", "utf-8");

  console.log(`\nОбновлено: ${updated} пакетов`);
  if (failed.length > 0) {
    const privateScopes = [
      ...new Set(
        failed.filter((p) => p.startsWith("@")).map((p) => p.split("/")[0])
      ),
    ];
    const hint = privateScopes.length
      ? ` (проверь NPM_TOKEN и add-registry для ${privateScopes.join(", ")})`
      : "";
    console.log(`\nНе обновлены${hint}: ${failed.join(", ")}`);
  }
  console.log("");
}

main().catch((err) => {
  exitWithError(err.message || String(err));
});
