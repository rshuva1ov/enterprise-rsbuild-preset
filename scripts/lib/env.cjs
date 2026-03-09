/**
 * Загрузка .env и конфиг приватных npm-реестров.
 */

const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = path.resolve(__dirname, "..");
const PRESET_ROOT = path.resolve(SCRIPTS_DIR, "..");
const ENV_PATH = path.join(PRESET_ROOT, ".env");
const REGISTRIES_PATH = path.join(SCRIPTS_DIR, "registries.json");

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  try {
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
  } catch {
    // Ошибка чтения .env — переменные не загружены
  }
}

loadEnv();

const PRIVATE_SCOPE = process.env.NPM_SCOPE?.trim() || null;
const NPM_REGISTRY_URL = process.env.NPM_REGISTRY_URL?.trim() || null;

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
  const fromFile = loadRegistriesFromFile();
  const fromEnv =
    PRIVATE_SCOPE && NPM_REGISTRY_URL
      ? { [PRIVATE_SCOPE]: NPM_REGISTRY_URL.replace(/\/$/, "") + "/" }
      : {};
  return { ...fromEnv, ...fromFile };
}

function getRegistryAuthHost(url) {
  const u = new URL(url);
  return `${u.host}${u.pathname.replace(/\/$/, "")}`;
}

module.exports = {
  PRIVATE_SCOPE,
  NPM_REGISTRY_URL,
  getRegistries,
  getRegistryAuthHost,
};
