/**
 * Сборка зависимостей из deps.json с учётом scope.
 */

const path = require("path");
const fs = require("fs");

const { getRegistries } = require("../lib/env.cjs");
const { validatePackageName } = require("../lib/cli.cjs");

const DEPS_PATH = path.resolve(__dirname, "..", "deps.json");

function loadDeps() {
  if (!fs.existsSync(DEPS_PATH)) {
    throw new Error(
      `Файл deps.json не найден: ${DEPS_PATH}. Запусти скрипт из корня preset.`
    );
  }
  let rawDeps;
  try {
    rawDeps = JSON.parse(fs.readFileSync(DEPS_PATH, "utf-8"));
  } catch (err) {
    throw new Error(
      `Не удалось прочитать deps.json: ${err.message}. Проверь формат JSON.`
    );
  }
  if (typeof rawDeps !== "object" || rawDeps === null) {
    throw new Error("deps.json должен содержать объект.");
  }
  const registries = getRegistries();
  const scopes = Object.keys(registries);
  const scopeForShortNames = scopes.length === 1 ? scopes[0] : null;

  const privateDeps = rawDeps.privateDependencies || {};
  const depsWithScope = {};
  for (const [name, version] of Object.entries(privateDeps)) {
    const fullName = name.startsWith("@")
      ? name
      : scopeForShortNames
        ? `${scopeForShortNames}/${name}`
        : null;
    const scope = fullName?.split("/")[0];
    if (!fullName || !scope || !registries[scope]) continue;
    const validated = validatePackageName(fullName);
    if (!validated.valid) continue;
    depsWithScope[validated.value] = version;
  }

  return {
    dependencies: { ...(rawDeps.dependencies || {}), ...depsWithScope },
    devDependencies: rawDeps.devDependencies || {},
  };
}

module.exports = { loadDeps };
