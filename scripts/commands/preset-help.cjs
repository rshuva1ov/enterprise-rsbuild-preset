#!/usr/bin/env node
/**
 * Общая справка по CLI preset.
 * Использование: pnpm help-enterprise
 */

const HELP = `
  Enterprise Rsbuild Preset — справка по командам

  Команды:
    pnpm enterprise      Создание нового проекта (React + Rsbuild)
    pnpm kill-enterprise  Удаление preset
    pnpm update-enterprise Обновление версий в scripts/deps.json
    pnpm add-enterprise   Управление приватными npm-реестрами
    pnpm help-enterprise  Эта справка

  Подробная справка по команде (--help / -h):
    pnpm enterprise --help
    pnpm add-enterprise --help
    pnpm update-enterprise --help
    pnpm kill-enterprise --help

  Примеры:
    pnpm enterprise --name=my-app --pm=pnpm --fsd=1
    pnpm add-enterprise              # интерактивное добавление
    pnpm add-enterprise list
`;

const [, , arg] = process.argv;
if (arg === "--help" || arg === "-h") {
  console.log(HELP);
  process.exit(0);
}

console.log(HELP);
