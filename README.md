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
   - **Приватный реестр** — добавить scope, URL и NPM_TOKEN? (y/n)

4. **Перейди в созданный проект** и настрой окружение (используй выбранный пакетный менеджер):

   ```bash
   cd ../my-app
   # добавь NPM_TOKEN в .npmrc
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
- **Приватный npm** — scope из `.env` и `add-registry`. Добавь `NPM_TOKEN` в `.npmrc` созданного проекта.

### Зависимости

- `@tanstack/react-query`, `react-router-dom`, `zustand`, `classnames`
- `{scope}/имя-пакета` — приватный пакет (scope из `.env` или `add-registry`)

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

Скрипт `update-deps` подтягивает последние версии всех библиотек из npm registry и обновляет `scripts/deps.json`.

```bash
pnpm update-deps
# или: npm run update-deps
# или: yarn update-deps
```

### Переменные окружения

| Переменная         | Назначение                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| `NPM_SCOPE`        | Scope приватного npm (например `@myorg`). Опционален, если в `registries.json` один scope — он используется для short-name. |
| `NPM_REGISTRY_URL` | URL приватного реестра. Нужен вместе с `NPM_SCOPE`.                                     |
| `NPM_TOKEN`        | Токен доступа к приватному реестру. Нужен для `update-deps`.                            |

**Как задать:**

1. Скопируй `.env.example` в `.env`.
2. Заполни `NPM_SCOPE`, `NPM_REGISTRY_URL`, `NPM_TOKEN` под свой реестр.
3. Скрипт загружает `.env` при запуске.

### Несколько приватных реестров

Рейстры задаются через `.env` (NPM_SCOPE + NPM_REGISTRY_URL) и/или CLI:

```bash
pnpm add-registry add @myorg https://npm.pkg.github.com/
pnpm add-registry remove @myorg
pnpm add-registry list
```

Рейстры сохраняются в `scripts/registries.json`.

В `deps.json` формат `privateDependencies`:

- **Short-name** (без `@`): `"имя-пакета": "^1.1.6"` — любой приватный пакет; scope берётся из `NPM_SCOPE` в `.env` или из одного scope в `registries.json`. При нескольких реестрах без `NPM_SCOPE` — short-name не разрешится.
- **Full-name** (с `@`): `"@myorg/components": "^2.0.0"` — scope должен быть в `registries.json` или `.env`

## Структура preset

```
enterprise-rsbuild-preset/
├── .env.example         # шаблон переменных (NPM_SCOPE, NPM_REGISTRY_URL, NPM_TOKEN)
├── package.json         # скрипты enterprise, kill-enterprise, update-deps, add-registry, preset-help
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
    │   ├── add-registry.cjs
    │   ├── kill-enterprise.cjs
    │   ├── update-deps.cjs
    │   └── help.cjs      # preset-help
    ├── templates/        # шаблоны для генерации
    ├── deps.json         # версии зависимостей (update-deps)
    └── registries.json   # scope → registry URL (add-registry)
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
pnpm preset-help
# или: npm run preset-help / yarn preset-help
```

Подробная справка по отдельной команде (`--help` / `-h`):

```bash
pnpm enterprise --help
pnpm add-registry --help
pnpm update-deps --help
pnpm kill-enterprise --help
```

## Возможные ошибки

| Ситуация                                      | Решение                                                        |
| --------------------------------------------- | -------------------------------------------------------------- |
| `Unsupported engine` / `EBADENGINE` при install | Обнови Node.js до 20.19+                 |
| Папка проекта уже существует и не пуста       | Выбери другое имя или удали/переименуй папку                   |
| `deps.json не найден`                         | Запускай скрипты из корня preset (`pnpm update-deps`)          |
| `Не удалось загрузить конфигурацию`           | Проверь наличие `scripts/deps.json`, `scripts/registries.json` |
| Приватные пакеты не обновляются в update-deps | Добавь `NPM_TOKEN` в `.env` или `add-registry add` для scope   |
| `Рейстр для @scope не найден`                 | Добавь реестр: `pnpm add-registry add @scope <url>`            |
| Scope должен начинаться с @                   | Используй формат `@myorg`, не `myorg`                          |

Без `.env` и без записей в `registries.json` приватные пакеты не добавляются. Настрой `.env` или `add-registry` под свой реестр.

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
