# Enterprise Rsbuild Preset

Генератор проектов на базе Rsbuild. Создаёт новый проект **рядом** с папкой preset, без лишних зависимостей в самом preset.

## Как использовать

1. **Скопируй** папку `enterprise-rsbuild-preset` на уровне с местом где хочешь создать проект.

2. **Запусти генерацию** (используй run своего пакетного менеджера):

   ```bash
   run enterprise
   ```

   Или напрямую:

   ```bash
   node scripts/commands/create-enterprise.cjs
   ```

   **Неинтерактивный режим** (все параметры через аргументы):

   ```bash
   node scripts/commands/create-enterprise.cjs --name=my-app --preset=react-ts --fsd=1 --no-registry
   ```

   `--pm=` — пакетный менеджер. `--no-registry` — пропустить вопрос о приватном реестре.

3. **Скрипт спросит**:

   - **Имя проекта** — папка создастся рядом с preset (например, `my-app`)
   - **Пакетный менеджер** — 1, 2 или 3
   - **Пресет** — React + TypeScript
   - **Архитектура** — 1 (FSD) или 2 (простая структура)
   - **Приватный реестр** — 1 = добавить scope, URL и NPM_TOKEN, 2 = пропустить

4. **Перейди в созданный проект** и настрой окружение (используй выбранный пакетный менеджер):

   ```bash
   cd ../my-app
   # задай NPM_TOKEN в окружении или в .npmrc
   run install
   run dev
   ```

## Что генерируется

### Сборка

- **Rsbuild** — сборщик на базе Rspack
- **React 19** + **TypeScript**
- **SASS** — стили с глобальными переменными
- **Compression** — gzip и brotli для production
- **Image compress** — сжатие jpeg, png, webp, avif, svg
- **Keycloak** — аутентификация (в `src/index.tsx` вызов `keycloakAuth` закомментирован — приложение запускается без авторизации; раскомментируй и закомментируй `startApp()` для включения)
- **Приватный реестр** — через `add-enterprise`. Добавь `NPM_TOKEN` в окружение или в `.npmrc` созданного проекта.

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

- **audit** — проверка уязвимостей в зависимостях (High/Critical) на pre-push

## Обновление версий зависимостей

Скрипт `update-enterprise` подтягивает последние версии всех библиотек из registry и обновляет `scripts/deps.json`.

```bash
run update-enterprise
```

### Приватные реестры (CLI)

Рейстры задаются через `add-enterprise` и сохраняются в `scripts/registries.json`:

```bash
run add-enterprise              # интерактивное добавление
run add-enterprise list         # список реестров
run add-enterprise remove @scope
```

При интерактивном добавлении можно указать `NPM_TOKEN` — он добавится в `.env` для `update-enterprise`.

В `deps.json` формат `privateDependencies`:

- **Short-name** (без `@`): `"имя-пакета": "^1.1.6"` — любой приватный пакет; scope берётся из одного scope в `registries.json`. При нескольких реестрах — используй full-name.
- **Full-name** (с `@`): `"@myorg/components": "^2.0.0"` — scope должен быть в `registries.json`

## Локальные файлы (не коммитить)

В `.gitignore` preset:

- **`.env`** — NPM_TOKEN для приватных реестров (добавляется через `add-enterprise`)
- **`scripts/registries.json`** — scope → URL приватных реестров (создаётся через `add-enterprise`)

Скопируй `scripts/registries.example.json` в `scripts/registries.json` и настрой реестры, либо используй `add-enterprise` для интерактивного добавления.

## Структура preset

```
enterprise-rsbuild-preset/
├── .env.example         # шаблон для NPM_TOKEN
├── .gitignore           # .env, scripts/registries.json, node_modules
├── package.json         # скрипты enterprise, kill-enterprise, update-enterprise, add-enterprise, help-enterprise, test:scenarios
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
    ├── deps.json             # версии зависимостей (update-enterprise)
    ├── registries.json       # scope → registry URL (add-enterprise, в .gitignore)
    └── registries.example.json
├── tests/
│   └── test-scenarios.cjs    # скрипт test:scenarios
```

## Удаление preset

Когда preset больше не нужен:

```bash
run kill-enterprise
```

Скрипт запросит подтверждение и удалит папку preset.

## Проверка сценариев

```bash
run test:scenarios
```

Проверяет работу при отсутствии `.env`, битом `registries.json`, некорректных `privateDependencies` и других сценариях.

## Справка по CLI

Общая справка по всем командам:

```bash
run help-enterprise
```

Подробная справка по отдельной команде (`--help` / `-h`):

```bash
run enterprise --help
run add-enterprise --help
run update-enterprise --help
run kill-enterprise --help
```

## Возможные ошибки

| Ситуация                                        | Решение                                                        |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `Unsupported engine` / `EBADENGINE` при install | Обнови Node.js до 20.19+                                       |
| Папка проекта уже существует и не пуста         | Выбери другое имя или удали/переименуй папку                   |
| `deps.json не найден`                           | Запускай скрипты из корня preset (`run update-enterprise`)   |
| `Не удалось загрузить конфигурацию`             | Проверь наличие `scripts/deps.json`, `scripts/registries.json` |
| Приватные пакеты не обновляются в update-enterprise | Добавь `NPM_TOKEN` через `add-enterprise` (при добавлении реестра) |
| `Рейстр для @scope не найден`                   | Запусти `add-enterprise` для добавления реестра                |
| Scope должен начинаться с @                     | Используй формат `@myorg`, не `myorg`                          |

Без записей в `registries.json` приватные пакеты не добавляются. Настрой реестр через `add-enterprise`.

## Результат

После `run enterprise` рядом появится папка с проектом. Все скрипты в `package.json`, Husky-хуки и README созданного проекта будут использовать выбранный пакетный менеджер:

```
parent/
├── enterprise-rsbuild-preset/   # preset (без изменений)
└── my-app/                     # новый проект
    ├── package.json
    ├── index.html
    ├── rsbuild.config.ts
    ├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
    ├── .npmrc               # NPM_TOKEN (при приватных пакетах)
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
