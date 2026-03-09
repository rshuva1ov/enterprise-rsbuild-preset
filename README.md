# Enterprise Rsbuild Preset

Генератор проектов на базе Rsbuild. Создаёт новый проект **рядом** с папкой preset, без лишних зависимостей в самом preset.

## Как использовать

1. **Скопируй** папку `enterprise-rsbuild-preset` на уровне с местом где хочешь создать проект.

2. **Запусти генерацию**:

   ```bash
   pnpm enterprise
   # или: npm run enterprise
   # или: yarn enterprise
   ```

   Или напрямую:

   ```bash
   node scripts/commands/create-enterprise.cjs
   ```

   **Неинтерактивный режим** (все параметры через аргументы):

   ```bash
   node scripts/commands/create-enterprise.cjs --name=my-app --pm=pnpm --preset=react-ts --fsd=1 --no-registry
   ```

   `--pm=` — `pnpm`, `yarn` или `npm`. `--no-registry` — пропустить вопрос о приватном реестре.

3. **Скрипт спросит**:

   - **Имя проекта** — папка создастся рядом с preset (например, `my-app`)
   - **Пакетный менеджер** — pnpm (1), yarn (2) или npm (3)
   - **Пресет** — React + TypeScript
   - **Архитектура** — 1 (FSD) или 2 (простая структура)
   - **Приватный реестр** — 1 = добавить scope, URL и NPM_TOKEN, 2 = пропустить

4. **Перейди в созданный проект** и настрой окружение (используй выбранный пакетный менеджер):

   ```bash
   cd ../my-app
   # задай NPM_TOKEN в окружении или в .npmrc
   pnpm install
   # или: yarn install / npm install
   pnpm dev
   # или: yarn dev / npm run dev
   ```

## Что генерируется

### Сборка

- **Rsbuild** — сборщик на базе Rspack
- **React 19** + **TypeScript**
- **SASS** — стили с глобальными переменными
- **Compression** — gzip и brotli для production
- **Image compress** — сжатие jpeg, png, webp, avif, svg
- **Keycloak** — аутентификация (в `src/index.tsx` вызов `keycloakAuth` закомментирован — приложение запускается без авторизации; раскомментируй и закомментируй `startApp()` для включения)
- **Приватный npm** — реестры через `add-enterprise`. Добавь `NPM_TOKEN` в окружение или в `.npmrc` созданного проекта.

### Зависимости

- `@tanstack/react-query`, `react-router-dom`, `zustand`, `classnames`
- `{scope}/имя-пакета` — приватный пакет (scope из `add-enterprise`)

### Линтеры и форматирование

- **ESLint** — `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`, `eslint-plugin-security` (проверка уязвимостей в коде)
- **Stylelint** — `stylelint-config-standard-scss`, snake_case для классов, kebab-case для переменных
- **Prettier** — `@trivago/prettier-plugin-sort-imports` (сортировка импортов по FSD)

### FSD (опционально)

- **Steiger** — `@feature-sliced/steiger-plugin` для проверки архитектуры
- Слои: `shared`, `entities`, `features`, `widgets`, `pages`, `app` (без `processes`)
- В слоях — `.gitignore` вместо пустого `index.ts`

### Git hooks (Husky)

- **pre-commit** — lint-staged (ESLint, Stylelint, Prettier для изменённых файлов)
- **pre-push** — lint, lint:style, audit, build

### Безопасность

- **npm audit** — проверка уязвимостей в зависимостях (High/Critical) на pre-push

## Обновление версий зависимостей

Скрипт `update-enterprise` подтягивает последние версии всех библиотек из npm registry и обновляет `scripts/deps.json`.

```bash
pnpm update-enterprise
# или: npm run update-enterprise
# или: yarn update-enterprise
```

### Приватные реестры (CLI)

Рейстры задаются через `add-enterprise` и сохраняются в `scripts/registries.json`:

```bash
pnpm add-enterprise              # интерактивное добавление
pnpm add-enterprise list         # список реестров
pnpm add-enterprise remove @scope
```

При интерактивном добавлении можно указать `NPM_TOKEN` — он добавится в `.env` для `update-enterprise`.

В `deps.json` формат `privateDependencies`:

- **Short-name** (без `@`): `"имя-пакета": "^1.1.6"` — любой приватный пакет; scope берётся из одного scope в `registries.json`. При нескольких реестрах — используй full-name.
- **Full-name** (с `@`): `"@myorg/components": "^2.0.0"` — scope должен быть в `registries.json`

## Структура preset

```
enterprise-rsbuild-preset/
├── .env.example         # NPM_TOKEN (добавляется через add-enterprise)
├── package.json         # скрипты enterprise, kill-enterprise, update-enterprise, add-enterprise, help-enterprise
├── README.md
└── scripts/
    ├── lib/              # утилиты
    │   ├── cli.cjs       # валидация, exitWithError
    │   └── env.cjs       # .env, getRegistries
    ├── config/           # конфигурация
    │   ├── deps.cjs      # сборка DEPS из deps.json
    │   └── pm.cjs        # PM_CONFIG, PRESETS
    ├── commands/         # CLI entry points
    │   ├── create-enterprise.cjs
    │   ├── add-registry.cjs    # add-enterprise
    │   ├── kill-enterprise.cjs
    │   ├── update-deps.cjs    # update-enterprise
    │   └── preset-help.cjs    # help-enterprise
    ├── templates/        # шаблоны для генерации
    ├── deps.json         # версии зависимостей (update-enterprise)
    └── registries.json   # scope → registry URL (add-enterprise)
```

## Удаление preset

Когда preset больше не нужен:

```bash
pnpm kill-enterprise
# или: npm run kill-enterprise / yarn kill-enterprise
```

Скрипт запросит подтверждение и удалит папку preset.

## Справка по CLI

Общая справка по всем командам:

```bash
pnpm help-enterprise
# или: npm run help-enterprise / yarn help-enterprise
```

Подробная справка по отдельной команде (`--help` / `-h`):

```bash
pnpm enterprise --help
pnpm add-enterprise --help
pnpm update-enterprise --help
pnpm kill-enterprise --help
```

## Возможные ошибки

| Ситуация                                        | Решение                                                        |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `Unsupported engine` / `EBADENGINE` при install | Обнови Node.js до 20.19+                                       |
| Папка проекта уже существует и не пуста         | Выбери другое имя или удали/переименуй папку                   |
| `deps.json не найден`                           | Запускай скрипты из корня preset (`pnpm update-enterprise`)   |
| `Не удалось загрузить конфигурацию`             | Проверь наличие `scripts/deps.json`, `scripts/registries.json` |
| Приватные пакеты не обновляются в update-enterprise | Добавь `NPM_TOKEN` через `add-enterprise` (при добавлении реестра) |
| `Рейстр для @scope не найден`                   | Запусти `add-enterprise` для добавления реестра                |
| Scope должен начинаться с @                     | Используй формат `@myorg`, не `myorg`                          |

Без записей в `registries.json` приватные пакеты не добавляются. Настрой реестр через `add-enterprise`.

## Результат

После `pnpm enterprise` (или `npm run enterprise` / `yarn enterprise`) рядом появится папка с проектом. Все скрипты в `package.json`, Husky-хуки и README созданного проекта будут использовать выбранный пакетный менеджер (pnpm, yarn или npm):

```
parent/
├── enterprise-rsbuild-preset/   # preset (без изменений)
└── my-app/                     # новый проект
    ├── package.json
    ├── index.html
    ├── rsbuild.config.ts
    ├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
    ├── .npmrc               # добавь NPM_TOKEN (при приватных пакетах)
    ├── .env.example
    ├── eslint.config.mjs
    ├── stylelint.config.mjs
    ├── .prettierrc, .prettierignore
    ├── steiger.config.ts        # только при FSD
    ├── .husky/
    │   ├── pre-commit           # lint-staged
    │   └── pre-push             # lint, lint:style, audit, build
    ├── src/
    │   ├── app/
    │   ├── pages/
    │   ├── shared/              # + entities, features, widgets при FSD
    │   └── index.tsx
    └── public/
```
