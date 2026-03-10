/**
 * Шаблоны package.json, .gitignore, README, .npmrc, .env.example, index.html, husky.
 */
const { PM_CONFIG } = require("../config/pm.cjs");
const { loadDeps } = require("../config/deps.cjs");
const { buildNpmrc } = require("./scope.cjs");

const GITIGNORE_BASE = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

dist
build
node_modules
dist-ssr
*.local
.env
.npmrc


# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

\${lockIgnoreLines}
.gitlab-ci.yml
`;

const getGitignore = (pm) => {
  const lockIgnoreLines = PM_CONFIG[pm].lockIgnore.join("\n");
  return GITIGNORE_BASE.replace("${lockIgnoreLines}", lockIgnoreLines);
};

const README_TEMPLATE = (title, withFsd, pm) => {
  const pmName = PM_CONFIG[pm].name;
  const fsdRows = withFsd
    ? `| \`${pmName} fsd\` | Проверка FSD (Steiger) |
| \`${pmName} fsd:fix\` | Автоисправление FSD |
`
    : "";
  return `# ${title}

React + TypeScript приложение на базе **Rsbuild** с Keycloak и приватными npm-реестрами.

> **Keycloak:** в \`src/index.tsx\` вызов \`keycloakAuth\` закомментирован — приложение запускается без авторизации. Для включения Keycloak раскомментируй \`keycloakAuth(startApp)\` и закомментируй \`startApp()\`.

---
## Установка

1. Задай \`NPM_TOKEN\` в окружении или подставь токен в \`.npmrc\` (если используешь приватные пакеты).
2. \`cp .env.example .env\` и настрой переменные.
3. \`${PM_CONFIG[pm].install}\`

---

## Скрипты

| Команда | Описание |
|---------|----------|
| \`${pmName} dev\` | Dev-сервер с HMR |
| \`${pmName} build\` | Production-сборка |
| \`${pmName} lint\` | ESLint (включая eslint-plugin-security) |
| \`${pmName} lint:fix\` | ESLint с автоисправлением |
| \`${pmName} lint:style\` | Stylelint |
| \`${pmName} lint:style:fix\` | Stylelint с автоисправлением |
| \`${pmName} format\` | Prettier |
| \`${pmName} audit\` | Проверка уязвимостей в зависимостях (High/Critical) |
${fsdRows}---

## Git hooks (Husky)

- **pre-commit** — lint-staged (ESLint, Stylelint, Prettier для изменённых файлов)
- **pre-push** — lint, lint:style, audit, build

---

## Переменные окружения

См. \`.env.example\`. Переменные с префиксом \`APP_\` доступны в коде через \`import.meta.env.APP_*\`.
`;
};

const getNpmrc = () => buildNpmrc();

const PACKAGE_JSON_TEMPLATE = (name, pm) => {
  const deps = loadDeps();
  const cfg = PM_CONFIG[pm];
  return JSON.stringify(
    {
      name: name
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, ""),
      version: "1.0.0",
      scripts: {
        dev: `${cfg.exec} rsbuild dev`,
        build: `${cfg.exec} rsbuild build`,
        audit: cfg.audit,
        fsd: "steiger check",
        "fsd:fix": "steiger check --fix",
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        "lint:style": 'stylelint "**/*.{css,scss}"',
        "lint:style:fix": 'stylelint "**/*.{css,scss}" --fix',
        format: "prettier --write .",
        prepare: "husky",
      },
      dependencies: deps.dependencies,
      devDependencies: deps.devDependencies,
    },
    null,
    2
  );
};

const ENV_EXAMPLE = `# PLATFORM_URLS
APP_HRP_URL=https://api.example.com
APP_AUTH_URL=https://auth.example.com
APP_SERVER_URL=https://api.example.com
APP_INFORMATION_SYSTEM_URL=https://api.example.com
APP_INFORMATION_SYSTEM_API_URL=https://api.example.com
APP_SOCKET_URL=https://api.example.com
APP_SERVER_URL_IMAGE=https://api.example.com

# Keycloak
APP_KEYCLOAK_REALM=master
APP_KEYCLOAK_CLIENT_ID=your-client-id
`;

const INDEX_HTML_TEMPLATE = (title) => `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/Icon-alabuga-color.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0;">
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`;

const getHuskyPreCommit = (pm) => `#!/usr/bin/env sh
${PM_CONFIG[pm].exec} lint-staged
`;

const getHuskyPrePush = (pm) => `#!/usr/bin/env sh
${PM_CONFIG[pm].run} lint
${PM_CONFIG[pm].run} lint:style
${PM_CONFIG[pm].run} audit
${PM_CONFIG[pm].run} build
`;

module.exports = {
  GITIGNORE_BASE,
  getGitignore,
  README_TEMPLATE,
  getNpmrc,
  PACKAGE_JSON_TEMPLATE,
  ENV_EXAMPLE,
  INDEX_HTML_TEMPLATE,
  getHuskyPreCommit,
  getHuskyPrePush,
};
