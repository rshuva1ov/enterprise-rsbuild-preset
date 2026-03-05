# Enterprise Rsbuild Preset

Генератор проектов на базе Rsbuild. Создаёт новый проект **рядом** с папкой preset, без лишних зависимостей в самом preset.

## Как использовать

1. **Скопируй** папку `enterprise-rsbuild-preset` на уровне с местом где хочешь создать проект.

2. **Запусти генерацию**:
   ```bash
   pnpm enterprise
   ```
   или напрямую:
   ```bash
   node scripts/create-enterprise.cjs
   ```

3. Скрипт спросит:
   - **Имя проекта** — папка создастся рядом с preset (например, `my-app`)
   - **Пресет** — React + TypeScript
   - **FSD структура** — да/нет

4. **Перейди в созданный проект** и настрой окружение:
   ```bash
   cd ../my-app
   # добавь NPM_TOKEN в .npmrc
   pnpm install
   pnpm dev
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

## Структура preset

```
enterprise-rsbuild-preset/
├── package.json          # только скрипты enterprise и kill, без зависимостей
├── README.md
└── scripts/
    ├── create-enterprise.cjs
    └── kill-enterprise.cjs
```

## Удаление preset

Когда preset больше не нужен:
```bash
pnpm kill enterprise
```
Скрипт запросит подтверждение и удалит папку preset.

## Результат

После `pnpm enterprise` рядом появится папка с проектом:

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
