/**
 * Функции для генерации scope-зависимых шаблонов (aliases, paths, npmrc).
 * Вызывают getRegistries() при каждом вызове, чтобы учитывать изменения registries.json.
 * Scope фильтруются по SCOPE_SAFE_REGEX для защиты от инъекций при ручном редактировании.
 */
const { getRegistries, getRegistryAuthHost } = require("../lib/env.cjs");
const { SCOPE_SAFE_REGEX } = require("../lib/cli.cjs");

function getSafeScopes() {
  const registries = getRegistries();
  return Object.keys(registries).filter((s) => SCOPE_SAFE_REGEX.test(s));
}

function buildScopeAliases() {
  const scopes = getSafeScopes();
  return scopes
    .map((s) => `"${s}": path.resolve(__dirname, "node_modules/${s}")`)
    .join(",\n      ");
}

function buildScopePaths() {
  const scopes = getSafeScopes();
  return scopes
    .map((s) => `"${s}/*": ["./node_modules/${s}/*"]`)
    .join(",\n      ");
}

function buildScopeImportOrder() {
  const scopes = getSafeScopes();
  if (scopes.length === 0) return "";
  return ",\n    " + scopes.map((s) => `"^${s}/(.*)$"`).join(",\n    ");
}

function buildNpmrc() {
  const registries = getRegistries();
  const lines = [];
  for (const [scope, url] of Object.entries(registries)) {
    if (!SCOPE_SAFE_REGEX.test(scope)) continue;
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
    return `# Приватные пакеты: в preset выполни add-enterprise и пересоздай проект.
# Без add-enterprise пакеты не попадут в package.json.
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
