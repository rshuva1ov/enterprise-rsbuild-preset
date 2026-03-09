#!/usr/bin/env node
/**
 * CLI для управления приватными npm-реестрами.
 * Использование: add-enterprise | add-enterprise list | add-enterprise remove <scope>
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const { validateScope, validateUrl, exitWithError, c, log } = require("../lib/cli.cjs");

const REGISTRIES_PATH = path.resolve(__dirname, "..", "registries.json");
const DEPS_PATH = path.resolve(__dirname, "..", "deps.json");
const PRESET_ROOT = path.resolve(__dirname, "..", "..");
const ENV_PATH = path.join(PRESET_ROOT, ".env");

const HELP = `
  Управление приватными npm-реестрами

  Использование:
    add-enterprise              — интерактивное добавление (scope, URL, NPM_TOKEN)
    add-enterprise list         — список реестров
    add-enterprise remove <scope> — удалить реестр

  Рейстры хранятся в scripts/registries.json.
`;

function ask(question, defaultValue = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const hint = defaultValue ? ` ${c.dim}[${defaultValue}]${c.reset}` : "";
  const prompt = `${c.cyan}${question}${c.reset}${hint}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve((answer || "").trim() || defaultValue);
    });
  });
}

function loadRegistries() {
  if (!fs.existsSync(REGISTRIES_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(REGISTRIES_PATH, "utf-8"));
    return typeof data === "object" && data !== null ? data : {};
  } catch (err) {
    exitWithError(
      `Не удалось прочитать registries.json: ${err.message}. Проверь формат файла.`
    );
  }
}

function saveRegistries(registries) {
  try {
    fs.writeFileSync(
      REGISTRIES_PATH,
      JSON.stringify(registries, null, 2) + "\n",
      "utf-8"
    );
  } catch (err) {
    exitWithError(`Не удалось записать registries.json: ${err.message}`);
  }
}

function add(scope, url) {
  const scopeResult = validateScope(scope);
  if (!scopeResult.valid) exitWithError(scopeResult.error);

  const urlResult = validateUrl(url);
  if (!urlResult.valid) exitWithError(urlResult.error);

  const registries = loadRegistries();
  registries[scopeResult.value] = urlResult.value;
  saveRegistries(registries);
  console.log(`Добавлен реестр: ${scopeResult.value} → ${urlResult.value}`);
}

function addPackageToDeps(packageName, version) {
  if (!fs.existsSync(DEPS_PATH)) return;
  let deps;
  try {
    deps = JSON.parse(fs.readFileSync(DEPS_PATH, "utf-8"));
  } catch {
    return;
  }
  if (typeof deps !== "object" || deps === null) return;
  deps.privateDependencies = deps.privateDependencies || {};
  deps.privateDependencies[packageName] = version;
  fs.writeFileSync(DEPS_PATH, JSON.stringify(deps, null, 2) + "\n", "utf-8");
}

function upsertEnvToken(token) {
  if (!token) return;
  let content = "";
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, "utf-8");
    if (/^NPM_TOKEN=/m.test(content)) {
      content = content.replace(/^NPM_TOKEN=.*$/m, `NPM_TOKEN=${token}`);
    } else {
      content = content.trimEnd() + (content.endsWith("\n") ? "" : "\n") + `NPM_TOKEN=${token}\n`;
    }
  } else {
    content = `NPM_TOKEN=${token}\n`;
  }
  fs.writeFileSync(ENV_PATH, content, "utf-8");
  log(`  NPM_TOKEN добавлен в .env`, c.green);
}

async function addInteractive() {
  console.log("");
  log("  ╭─────────────────────────────────────────╮", c.cyan);
  log("  │     Добавление приватного реестра       │", c.cyan);
  log("  ╰─────────────────────────────────────────╯", c.cyan);
  console.log("");

  let scope = await ask("  Scope (например @myorg)", "");
  for (let i = 0; i < 3; i++) {
    const r = validateScope(scope);
    if (r.valid) {
      scope = r.value;
      break;
    }
    log(`  ${c.yellow}⚠ ${r.error}${c.reset}`, "");
    scope = await ask("  Scope", "");
  }
  const scopeResult = validateScope(scope);
  if (!scopeResult.valid) exitWithError(scopeResult.error);

  let url = await ask("  URL реестра (например https://npm.pkg.github.com/)", "");
  for (let i = 0; i < 3; i++) {
    const r = validateUrl(url);
    if (r.valid) break;
    log(`  ${c.yellow}⚠ ${r.error}${c.reset}`, "");
    url = await ask("  URL реестра", "");
  }
  const urlResult = validateUrl(url);
  if (!urlResult.valid) exitWithError(urlResult.error);

  add(scopeResult.value, urlResult.value);

  const pkgName = await ask(
    `  Пакет для добавления в зависимости (например ui-kit, Enter — пропустить)`,
    ""
  );
  if (pkgName.trim()) {
    const fullName = pkgName.startsWith("@") ? pkgName.trim() : `${scopeResult.value}/${pkgName.trim()}`;
    const version = await ask(`  Версия для ${fullName}`, "^1.0.0");
    addPackageToDeps(fullName, version.trim() || "^1.0.0");
    log(`  Добавлен в deps.json: ${fullName}`, c.green);
  }

  const token = await ask("  NPM_TOKEN (опционально, для .env — Enter чтобы пропустить)", "");
  if (token) {
    upsertEnvToken(token);
  } else {
    log(`  ${c.dim}Добавь NPM_TOKEN в .env вручную для update-enterprise и установки пакетов${c.reset}`, "");
  }
  console.log("");
}

function remove(scope) {
  const scopeResult = validateScope(scope);
  if (!scopeResult.valid) exitWithError(scopeResult.error);

  const registries = loadRegistries();
  if (!(scopeResult.value in registries)) {
    exitWithError(
      `Рейстр для ${scopeResult.value} не найден. Используй 'add-enterprise list' для списка.`
    );
  }
  delete registries[scopeResult.value];
  saveRegistries(registries);
  console.log(`Удалён реестр: ${scopeResult.value}`);
}

function list() {
  const { getRegistries } = require("../lib/env.cjs");
  const registries = getRegistries();
  const entries = Object.entries(registries);
  if (entries.length === 0) {
    console.log(
      "\nНет реестров. Запусти 'add-enterprise' для интерактивного добавления.\n"
    );
    return;
  }
  console.log("\nПриватные npm-реестры:\n");
  for (const [scope, url] of entries) {
    console.log(`  ${scope} → ${url}`);
  }
  console.log("");
}

const [, , cmd, scope, url] = process.argv;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

async function main() {
  if (cmd === "add") {
    if (!scope || !url) {
      await addInteractive();
    } else {
      add(scope, url);
    }
    return;
  }
  if (cmd === "remove") {
    if (!scope) {
      exitWithError("Не указан scope. Использование: add-enterprise remove <scope>");
    }
    remove(scope);
    return;
  }
  if (cmd === "list") {
    list();
    return;
  }
  if (cmd && !["add", "remove", "list"].includes(cmd)) {
    exitWithError(`Неизвестная команда: ${cmd}. Используй: add, remove, list`);
  }
  await addInteractive();
}

if (require.main === module) {
  main().catch((err) => {
    exitWithError(err.message || String(err));
  });
} else {
  module.exports = { addInteractive };
}
