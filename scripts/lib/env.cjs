/**
 * Загрузка .env и конфиг приватных npm-реестров.
 * Безопасная загрузка: только разрешённые ключи, проверка пути, валидация файла.
 * Без внешних зависимостей — встроенный парсер .env.
 */

const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = path.resolve(__dirname, "..");
const PRESET_ROOT = path.resolve(SCRIPTS_DIR, "..");
const ENV_PATH = path.join(PRESET_ROOT, ".env");
const REGISTRIES_PATH = path.join(SCRIPTS_DIR, "registries.json");

/** Только эти ключи загружаются из .env — защита от NODE_OPTIONS и прочих инъекций */
const ALLOWED_ENV_KEYS = new Set(["NPM_TOKEN"]);

function parseEnvFile(content) {
  const result = {};
  if (typeof content !== "string") return result;
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  });
  return result;
}

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;

  try {
    const stat = fs.statSync(ENV_PATH);
    if (!stat.isFile()) {
      console.error(
        `\x1b[33m⚠ .env не является файлом: ${ENV_PATH}\x1b[0m`
      );
      return;
    }

    const realEnvPath = fs.realpathSync(ENV_PATH);
    const realRoot = fs.realpathSync(PRESET_ROOT);
    const rootWithSep = realRoot.endsWith(path.sep) ? realRoot : realRoot + path.sep;
    if (!realEnvPath.startsWith(rootWithSep) && realEnvPath !== realRoot) {
      console.error(
        `\x1b[33m⚠ .env вне директории проекта: ${realEnvPath}\x1b[0m`
      );
      return;
    }

    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const parsed = parseEnvFile(content);

    for (const [key, value] of Object.entries(parsed)) {
      if (ALLOWED_ENV_KEYS.has(key) && value != null && !process.env[key]) {
        process.env[key] = String(value).replace(/[\r\n]/g, "").trim();
      }
    }
  } catch (err) {
    const code = err?.code ?? "";
    const msg = err?.message ?? String(err);
    if (code === "ENOENT") {
      return;
    }
    if (code === "EACCES") {
      console.error(`\x1b[33m⚠ Нет доступа к .env: ${ENV_PATH}\x1b[0m`);
      return;
    }
    console.error(
      `\x1b[33m⚠ Не удалось загрузить .env: ${msg}\x1b[0m`
    );
  }
}

loadEnv();

function loadRegistriesFromFile() {
  if (!fs.existsSync(REGISTRIES_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(REGISTRIES_PATH, "utf-8"));
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    return {};
  }
}

function getRegistries() {
  return loadRegistriesFromFile();
}

function getRegistryAuthHost(url) {
  const u = new URL(url);
  return `${u.host}${u.pathname.replace(/\/$/, "")}`;
}

module.exports = {
  getRegistries,
  getRegistryAuthHost,
};
