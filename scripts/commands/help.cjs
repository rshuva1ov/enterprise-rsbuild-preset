#!/usr/bin/env node
/**
 * Общая справка по CLI preset.
 * Использование: pnpm preset-help
 */

const HELP = `
  Enterprise Rsbuild Preset — справка по командам

  Команды:
    pnpm enterprise      Создание нового проекта (React + Rsbuild)
    pnpm kill-enterprise Удаление preset
    pnpm update-deps     Обновление версий в scripts/deps.json
    pnpm add-registry    Управление приватными npm-реестрами
    pnpm preset-help     Эта справка

  Подробная справка по команде (--help / -h):
    pnpm enterprise --help
    pnpm add-registry --help
    pnpm update-deps --help
    pnpm kill-enterprise --help

  Примеры:
    pnpm enterprise --name=my-app --pm=pnpm --fsd=1
    pnpm add-registry              # интерактивное добавление реестра и токена
    pnpm add-registry add @myorg https://npm.pkg.github.com/
    pnpm add-registry list
`;

const [, , arg] = process.argv;
if (arg === "--help" || arg === "-h") {
  console.log(HELP);
  process.exit(0);
}

console.log(HELP);
