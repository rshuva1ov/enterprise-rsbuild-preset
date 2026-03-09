/**
 * Сборка зависимостей из deps.json с учётом scope.
 */

const path = require("path");
const fs = require("fs");

const { PRIVATE_SCOPE, getRegistries } = require("../lib/env.cjs");

const DEPS_PATH = path.resolve(__dirname, "..", "deps.json");

function loadDeps() {
  const rawDeps = JSON.parse(fs.readFileSync(DEPS_PATH, "utf-8"));
  const registries = getRegistries();
  const scopes = Object.keys(registries);
  const scopeForShortNames =
    PRIVATE_SCOPE || (scopes.length === 1 ? scopes[0] : null);

  const privateDeps = rawDeps.privateDependencies || {};
  const depsWithScope = {};
  for (const [name, version] of Object.entries(privateDeps)) {
    const fullName = name.startsWith("@")
      ? name
      : scopeForShortNames
        ? `${scopeForShortNames}/${name}`
        : null;
    const scope = fullName?.split("/")[0];
    if (fullName && scope && registries[scope]) {
      depsWithScope[fullName] = version;
    }
  }

  return {
    dependencies: { ...(rawDeps.dependencies || {}), ...depsWithScope },
    devDependencies: rawDeps.devDependencies || {},
  };
}

module.exports = { loadDeps };
