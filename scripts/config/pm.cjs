/**
 * Конфигурация пакетных менеджеров.
 */

const PM_CONFIG = {
  pnpm: {
    name: "pnpm",
    exec: "pnpm exec",
    run: "pnpm run",
    install: "pnpm install",
    audit: "pnpm audit --audit-level=high",
    lockIgnore: ["yarn.lock", "package-lock.json"],
  },
  npm: {
    name: "npm",
    exec: "npx",
    run: "npm run",
    install: "npm install",
    audit: "npm audit --audit-level=high",
    lockIgnore: ["yarn.lock", "pnpm-lock.yaml"],
  },
  yarn: {
    name: "yarn",
    exec: "yarn exec",
    run: "yarn run",
    install: "yarn install",
    audit: "yarn audit",
    lockIgnore: ["package-lock.json", "pnpm-lock.yaml"],
  },
};

const PRESETS = [{ id: "react-ts", name: "React + TypeScript", value: "react-ts" }];

module.exports = { PM_CONFIG, PRESETS };
