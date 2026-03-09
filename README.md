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
   node scripts/create-enterprise.cjs
   ```

   **Неинтерактивный режим** (все параметры через аргументы):

   ```bash
   node scripts/create-enterprise.cjs --name=my-app --pm=pnpm --preset=react-ts --fsd=y
   ```

   `--pm=` — `pnpm`, `yarn` или `npm`

3. **Скрипт спросит**:
   - **Имя проекта** — папка создастся рядом с preset (например, `my-app`)
   - **Пакетный менеджер** — pnpm (1), yarn (2) или npm (3)
   - **Пресет** — React + TypeScript
   - **FSD структура** — да/нет

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
- **React 18** + **TypeScript**
- **SASS** — стили с глобальными переменными
- **Compression** — gzip и brotli для production
- **Image compress** — сжатие jpeg, png, webp, avif, svg
- **Keycloak** — аутентификация (в `src/index.tsx` вызов `keycloakAuth` закомментирован — приложение запускается без авторизации; раскомментируй и закомментируй `startApp()` для включения)
- **Приватный npm** `@games-alabuga` — добавь \`NPM_TOKEN\` в \`.npmrc\`

### Зависимости
- `@tanstack/react-query`, `react-router-dom`, `zustand`, `classnames`
- `@games-alabuga/ui-kit`

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

| Переменная   | Назначение |
|--------------|------------|
| `NPM_TOKEN`  | Токен доступа к приватному реестру `@games-alabuga` (GitLab). Без него скрипт не сможет обновить `@games-alabuga/ui-kit` — остальные пакеты из публичного npm обновятся. |

**Как задать:**

1. Скопируй `.env.example` в `.env` в корне preset.
2. Подставь свой токен (GitLab: User Settings → Access Tokens, scope: `read_api`, `read_registry`).
3. Скрипт автоматически загружает `.env` при запуске.

Либо задай в окружении перед запуском: `NPM_TOKEN=glpat-xxx pnpm update-deps`.

## Структура preset

```
enterprise-rsbuild-preset/
├── .env.example         # шаблон переменных (NPM_TOKEN для update-deps)
├── package.json         # только скрипты enterprise и kill, без зависимостей
├── README.md
└── scripts/
    ├── constants.cjs     # константы и шаблоны для генерации
    ├── create-enterprise.cjs
    ├── deps.json        # версии зависимостей (обновляется через update-deps)
    ├── kill-enterprise.cjs
    └── update-deps.cjs  # скрипт обновления версий
```

## Удаление preset

Когда preset больше не нужен:

```bash
pnpm kill enterprise
# или: npm run kill -- enterprise
# или: yarn kill enterprise
```

Скрипт запросит подтверждение и удалит папку preset.

## Результат

После `pnpm enterprise` (или `npm run enterprise` / `yarn enterprise`) рядом появится папка с проектом. Все скрипты в `package.json`, Husky-хуки и README созданного проекта будут использовать выбранный пакетный менеджер (pnpm, yarn или npm):

```
parent/
├── enterprise-rsbuild-preset/   # preset (без изменений)
└── my-app/                     # новый проект
    ├── package.json
    ├── rsbuild.config.ts
    ├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
    ├── .npmrc               # добавь NPM_TOKEN
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