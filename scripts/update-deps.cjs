#!/usr/bin/env node
/**
 * Обновляет scripts/deps.json до последних версий пакетов из npm registry.
 * Для @games-alabuga требуется NPM_TOKEN (приватный реестр GitLab).
 * Загружает переменные из .env в корне preset (если файл есть).
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const PRESET_ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(PRESET_ROOT, ".env");
const DEPS_PATH = path.resolve(__dirname, "deps.json");

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  const content = fs.readFileSync(ENV_PATH, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  });
}

loadEnv();
const NPM_REGISTRY = "https://registry.npmjs.org";
const GAMES_ALABUGA_REGISTRY =
  "https://gitlab.alabuga.space/api/v4/projects/102/packages/npm";

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

async function getLatestVersion(packageName) {
  const encoded = encodeURIComponent(packageName);
  const isPrivate = packageName.startsWith("@games-alabuga/");
  const registry = isPrivate ? GAMES_ALABUGA_REGISTRY : NPM_REGISTRY;
  const url = `${registry}/${encoded}`;

  const headers = {};
  if (isPrivate && process.env.NPM_TOKEN) {
    headers.Authorization = `Bearer ${process.env.NPM_TOKEN}`;
  }

  try {
    const data = await fetchJson(url, headers);
    const version = data["dist-tags"]?.latest ?? data.version;
    return version ? `^${version}` : null;
  } catch (err) {
    return null;
  }
}

function getAllPackages(deps) {
  return [
    ...Object.keys(deps.dependencies || {}),
    ...Object.keys(deps.devDependencies || {}),
  ];
}

async function main() {
  const deps = JSON.parse(fs.readFileSync(DEPS_PATH, "utf-8"));
  const packages = getAllPackages(deps);
  const total = packages.length;
  let updated = 0;
  const failed = [];

  console.log(`\nОбновление версий ${total} пакетов...\n`);

  for (const name of packages) {
    const version = await getLatestVersion(name);
    if (version) {
      if (deps.dependencies?.[name]) {
        deps.dependencies[name] = version;
        updated++;
      } else if (deps.devDependencies?.[name]) {
        deps.devDependencies[name] = version;
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
    console.log(`\nНе обновлены (проверь NPM_TOKEN для @games-alabuga): ${failed.join(", ")}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
