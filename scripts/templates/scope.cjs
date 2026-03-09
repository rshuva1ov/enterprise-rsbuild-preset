/**
 * Функции для генерации scope-зависимых шаблонов (aliases, paths, npmrc).
 * Вызывают getRegistries() при каждом вызове, чтобы учитывать изменения registries.json.
 */
const { getRegistries, getRegistryAuthHost } = require("../lib/env.cjs");

function buildScopeAliases() {
  const registries = getRegistries();
  const scopes = Object.keys(registries);
  return scopes
    .map((s) => `"${s}": path.resolve(__dirname, "node_modules/${s}")`)
    .join(",\n      ");
}

function buildScopePaths() {
  const registries = getRegistries();
  const scopes = Object.keys(registries);
  return scopes
    .map((s) => `"${s}/*": ["./node_modules/${s}/*"]`)
    .join(",\n      ");
}

function buildScopeImportOrder() {
  const scopes = Object.keys(getRegistries());
  if (scopes.length === 0) return "";
  return ",\n    " + scopes.map((s) => `"^${s}/(.*)$"`).join(",\n    ");
}

function buildNpmrc() {
  const registries = getRegistries();
  const lines = [];
  for (const [scope, url] of Object.entries(registries)) {
    lines.push(`${scope}:registry=${url}`);
  }
  const seenHosts = new Set();
  for (const url of Object.values(registries)) {
    const host = getRegistryAuthHost(url);
    if (!host || seenHosts.has(host)) continue;
    seenHosts.add(host);
    lines.push(`//${host}/:_authToken="\${NPM_TOKEN}"`);
  }
  if (lines.length === 0) {
    return `# Приватные пакеты требуют настройки реестра.
# Вариант 1: в preset выполни: pnpm add-registry add @твой-scope https://registry-url/
# Вариант 2: настрой .env в preset (NPM_SCOPE, NPM_REGISTRY_URL) и пересоздай проект
# Вариант 3: добавь вручную:
#   @твой-scope:registry=https://registry-url/
#   //registry-host/:_authToken="\${NPM_TOKEN}"
`;
  }
  return lines.join("\n");
}

module.exports = {
  buildScopeAliases,
  buildScopePaths,
  buildScopeImportOrder,
  buildNpmrc,
};
