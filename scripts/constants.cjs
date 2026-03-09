// Константы и шаблоны для enterprise-rsbuild-preset

const PRESETS = [
  { id: "react-ts", name: "React + TypeScript", value: "react-ts" },
];

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

const RSBUILD_BASE = `import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginImageCompress } from "@rsbuild/plugin-image-compress";
import { pluginSass } from "@rsbuild/plugin-sass";
import CompressionPlugin from "compression-webpack-plugin";
import path from "path";

const compressionFilter = /\\.(js|mjs|css|html|json|svg|map|wasm|xml|txt|ttf|otf|woff|eot|otf|woff2)$/i;
const { publicVars } = loadEnv({ prefixes: ["APP_"] });

export default defineConfig({
  html: {
    title: "Enterprise App",
  },

  output: {
    cssModules: {
      exportLocalsConvention: "camelCase",
      localIdentName: "[name]__[local]___[hash:base64:5]",
    },
    sourceMap: {
      css: true,
    },
  },

  plugins: [
    pluginReact(),
    pluginImageCompress(["jpeg", "png", "webp", "avif", "svg"]),
    pluginSass({
      sassLoaderOptions: {
        additionalData: SASS_ADDITIONAL,
        sassOptions: {
          includePaths: SASS_INCLUDE_PATHS,
          quietDeps: true,
        },
      },
    }),
  ],

  source: {
    define: publicVars,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      ...ALIASES
    },
  },

  tools: {
    rspack: (config) => {
      config.plugins?.push(
        new CompressionPlugin({
          filename: "[path][base].gz[query]",
          algorithm: "gzip",
          test: compressionFilter,
          threshold: 10240,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          filename: "[path][base].br[query]",
          algorithm: "brotliCompress",
          test: compressionFilter,
          threshold: 10240,
          minRatio: 0.8,
          compressionOptions: { level: 11 },
        })
      );

      return config;
    },
  },
});
`;

const RSBUILD_ALIASES_FSD = `"@shared": path.resolve(__dirname, "src/shared"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@features": path.resolve(__dirname, "src/features"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@app": path.resolve(__dirname, "src/app"),
      "@styles": path.resolve(__dirname, "src/app/styles"),
      "@games-alabuga": path.resolve(__dirname, "node_modules/@games-alabuga"),`;

const RSBUILD_ALIASES_SIMPLE = `"@app": path.resolve(__dirname, "src/app"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@games-alabuga": path.resolve(__dirname, "node_modules/@games-alabuga"),`;

const SASS_ADDITIONAL_FN = [
  '(content, loaderContext) => {',
  '  const contentStr = typeof content === "string" ? content : content.toString("utf-8");',
  '  const helpersPath = path.resolve(__dirname, "src/app/styles/helpers").replace(/\\\\/g, "/");',
  '  return `@use "${helpersPath}/index" as *;\\n${contentStr}`;',
  '}'
].join('\n');

const STEIGER_CONFIG = `import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/**"],
    rules: {
      "fsd/forbidden-imports": [
        "error",
        {
          allow: [
            { from: "@shared", to: ["@entities"] },
            { from: "@entities", to: ["@entities"] },
            { from: "@shared", to: ["@features"] },
            { from: "@entities", to: ["@features"] },
            { from: "@shared", to: ["@widgets"] },
            { from: "@entities", to: ["@widgets"] },
            { from: "@features", to: ["@widgets"] },
            { from: "@shared", to: ["@pages"] },
            { from: "@entities", to: ["@pages"] },
            { from: "@features", to: ["@pages"] },
            { from: "@widgets", to: ["@pages"] },
            { from: "@app", to: ["@pages"] }
          ]
        }
      ],
      "fsd/inconsistent-naming": "error",
      "fsd/insignificant-slice": "warn",
      "fsd/no-layer-public-api": "off",
      "fsd/no-public-api-sidestep": "off"
    }
  }
]);
`;

const APP_FSD = `import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { routes } from "@app/routes";

import "./styles/index.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 5 * 60 * 1000 },
  },
});

export function App() {
  return (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
    </QueryClientProvider>
       </React.StrictMode>
  );
}
`;

const APP_SIMPLE = `import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./styles/index.scss";

const router = createBrowserRouter([{ path: "/", element: <div>Hello</div> }]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 3, staleTime: 5 * 60 * 1000 },
  },
});

export function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
`;

const INDEX_TSX_FSD = `import ReactDOM from "react-dom/client";

import { App } from "@app/App";
import { keycloakAuth } from "@shared/keycloak";

const startApp = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
};

// keycloakAuth(startApp);
startApp();
`;

const INDEX_TSX_SIMPLE = `import ReactDOM from "react-dom/client";

import { App } from "@app/App";
import { keycloakAuth } from "@shared/keycloak";

const startApp = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
};

// keycloakAuth(startApp);
startApp();
`;

const ROUTES_FSD = `import { Navigate, createBrowserRouter } from "react-router-dom";

import { ROUTER_CONFIG } from "@shared/config";
import { MainPage } from "@pages/main";

export const routes = createBrowserRouter(
  [
    { path: "/", element: <MainPage /> },
    { path: "*", element: <Navigate to={ROUTER_CONFIG.fallbackPath} replace /> },
  ],
  { basename: ROUTER_CONFIG.basename }
);
`;

const MAIN_PAGE_INDEX = `export { MainPage } from "./ui";
`;

const MAIN_PAGE_UI = `import styles from "./index.module.scss";

const ROCKET_SVG = (
  <svg width="64" height="100" viewBox="0 0 64 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 0L24 32h16L32 0z" fill="#7dd3fc" />
    <rect x="24" y="32" width="16" height="36" rx="2" fill="#38bdf8" />
    <circle cx="32" cy="48" r="5" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1.5" />
    <path d="M24 68L16 88h16L24 68z" fill="#0ea5e9" />
    <path d="M40 68L48 88H32L40 68z" fill="#0ea5e9" />
    <rect x="20" y="68" width="24" height="6" fill="#0284c7" />
    <path d="M28 74L32 96L36 74H28z" fill="#fbbf24" opacity="0.9" />
  </svg>
);

export function MainPage() {
  return (
    <div className={styles.root}>
      <div className={styles.rocket}>{ROCKET_SVG}</div>
      <h1 className={styles.title}>Enterprise Rsbuild Preset</h1>
      <p className={styles.description}>
        Проект собран на enterprise-rsbuild-preset
      </p>
    </div>
  );
}
`;

const CONFIG_TS = `const env = import.meta.env;

export const PLATFORM_URLS = {
  HRP: env.APP_HRP_URL ?? "/",
  AUTH: env.APP_AUTH_URL ?? "",
  SERVER: env.APP_SERVER_URL ?? "",
  INFORMATION_SYSTEM: env.APP_INFORMATION_SYSTEM_URL ?? "",
  INFORMATION_SYSTEM_API: env.APP_INFORMATION_SYSTEM_API_URL ?? "",
  SOCKET: env.APP_SOCKET_URL ?? "",
  IMAGE: env.APP_SERVER_URL_IMAGE ?? "",
} as const;

export const ROUTER_CONFIG = {
  basename: "/",
  fallbackPath: "/",
} as const;
`;

const COOKIE_INDEX = `const COOKIE_MAX_AGE_DAYS = 365;

/**
 * Безопасное получение значения из cookies
 */
export const getCookie = (name: string): string | null => {
  try {
    const matches = document.cookie.match(
      new RegExp(\`(?:^|; )\${name.replace(/([.$?*|{}()[\\]\\\\/+^])/g, "\\\\$1")}=([^;]*)\`)
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  } catch (error) {
    console.error(\`Error getting cookie \${name}:\`, error);
    return null;
  }
};

/**
 * Получение cookie как булева значения
 */
export const getCookieAsBoolean = (name: string): boolean => getCookie(name) === "true";

/**
 * Безопасная установка значения в cookies
 */
export const setCookie = (name: string, value: string, maxAgeDays = COOKIE_MAX_AGE_DAYS): void => {
  try {
    const maxAge = maxAgeDays * 24 * 60 * 60;
    document.cookie = \`\${name}=\${encodeURIComponent(value)}; path=/; max-age=\${maxAge}; SameSite=Lax\`;
  } catch (error) {
    console.error(\`Error setting cookie \${name}:\`, error);
  }
};

/**
 * Удаление cookie
 */
export const clearCookie = (name: string): void => {
  try {
    document.cookie = \`\${name}=; path=/; max-age=0; SameSite=Lax\`;
  } catch (error) {
    console.error(\`Error clearing cookie \${name}:\`, error);
  }
};

/**
 * Удаление всех cookies текущего домена
 */
export const clearAllCookies = (): void => {
  try {
    document.cookie.split("; ").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (name) {
        document.cookie = \`\${name}=; path=/; max-age=0; SameSite=Lax\`;
      }
    });
  } catch (error) {
    console.error("Error clearing all cookies:", error);
  }
};
`;

const SESSION_STORAGE_INDEX = `/**
 * Утилиты для работы с sessionStorage
 * Используется для хранения чувствительных данных (токены, user_uid)
 */

export enum ESSName {
  USER_TOKEN = "user_token",
  REFRESH_TOKEN = "refresh_token",
  USER_UID = "user_uid"
}

/**
 * Безопасное получение значения из sessionStorage
 */
export const getSessionStorage = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error(\`Error getting sessionStorage item \${key}:\`, error);
    return null;
  }
};

/**
 * Безопасное сохранение значения в sessionStorage
 */
export const setSessionStorage = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.error(\`Error setting sessionStorage item \${key}:\`, error);
  }
};

/**
 * Безопасное удаление значения из sessionStorage
 */
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(\`Error removing sessionStorage item \${key}:\`, error);
  }
};

/**
 * Очистка всех чувствительных данных из sessionStorage
 */
export const clearSessionStorage = (): void => {
  try {
    Object.values(ESSName).forEach((key) => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing sessionStorage:", error);
  }
};
`;

const KEYCLOAK_INDEX_FSD = `import Keycloak, { type KeycloakOnLoad } from "keycloak-js";

import { PLATFORM_URLS } from "@shared/config";
import { clearAllCookies } from "@shared/cookie";
import { ESSName, clearSessionStorage, getSessionStorage, setSessionStorage } from "@shared/sessionStorage";

type KeycloakConfig = {
  url: string;
  realm: string;
  clientId: string;
  onLoad: KeycloakOnLoad;
};

const env = import.meta.env;

const getInitConfig = (): KeycloakConfig => ({
  url: PLATFORM_URLS.AUTH,
  realm: env.APP_KEYCLOAK_REALM ?? "master",
  clientId: env.APP_KEYCLOAK_CLIENT_ID ?? "",
  onLoad: "login-required",
});

const initOptions = getInitConfig();
const keycloak = new Keycloak(initOptions);

type Callback = () => void;

/**
 * Сохранение токенов в sessionStorage для безопасности
 * sessionStorage очищается при закрытии вкладки
 */
const setTokensToSessionStorage = (): void => {
  const token = keycloak.token ?? "";
  const refreshToken = keycloak.refreshToken ?? "";

  setSessionStorage(ESSName.USER_TOKEN, token);
  setSessionStorage(ESSName.REFRESH_TOKEN, refreshToken);
};

export const keycloakAuth = (callback: Callback): void => {
  keycloak
    .init({ onLoad: initOptions.onLoad })
    .then((auth: boolean) => {
      if (!auth) {
        setTimeout(() => {
          window.location.href = PLATFORM_URLS.HRP;
        });
      } else {
        setTokensToSessionStorage();

        if (keycloak.tokenParsed) {
          const tokenParsed = keycloak.tokenParsed.sub ?? "";
          setSessionStorage(ESSName.USER_UID, tokenParsed);
        }

        let alreadyStartApp = false;

        const checkRefresh = (): void => {
          keycloak
            .updateToken(70)
            .then((refreshed: boolean) => {
              if (refreshed) {
                if (getSessionStorage(ESSName.USER_TOKEN)) {
                  setTokensToSessionStorage();
                }
                if (keycloak.tokenParsed) {
                  const tokenParsed = keycloak.tokenParsed.sub ?? "";
                  setSessionStorage(ESSName.USER_UID, tokenParsed);
                }
              }
              if (!alreadyStartApp) {
                callback();
                alreadyStartApp = true;
              }
            })
            .catch((error: Error) => {
              console.error("Error refreshing token:", error);
              if (!alreadyStartApp) {
                callback();
                alreadyStartApp = true;
              }
            });
        };

        if (!alreadyStartApp) {
          callback();
          alreadyStartApp = true;
        }

        setInterval(checkRefresh, 10000);
      }
    })
    .catch((error: Error) => {
      console.error("Keycloak initialization error:", error);
      onLogOutKeycloak();
      window.location.href = PLATFORM_URLS.HRP;
    });
};

/**
 * Выход из системы с очисткой sessionStorage и cookies
 */
export const onLogOutKeycloak = (): void => {
  clearSessionStorage();
  clearAllCookies();
  keycloak.logout();
};
`;

const KEYCLOAK_INDEX_SIMPLE = `import Keycloak, { type KeycloakOnLoad } from "keycloak-js";

import { PLATFORM_URLS } from "@shared/config";
import { clearAllCookies } from "@shared/cookie";
import { ESSName, clearSessionStorage, getSessionStorage, setSessionStorage } from "@shared/sessionStorage";

type KeycloakConfig = {
  url: string;
  realm: string;
  clientId: string;
  onLoad: KeycloakOnLoad;
};

const env = import.meta.env;

const getInitConfig = (): KeycloakConfig => ({
  url: PLATFORM_URLS.AUTH,
  realm: env.APP_KEYCLOAK_REALM ?? "master",
  clientId: env.APP_KEYCLOAK_CLIENT_ID ?? "",
  onLoad: "login-required",
});

const initOptions = getInitConfig();
const keycloak = new Keycloak(initOptions);

type Callback = () => void;

/**
 * Сохранение токенов в sessionStorage для безопасности
 * sessionStorage очищается при закрытии вкладки
 */
const setTokensToSessionStorage = (): void => {
  const token = keycloak.token ?? "";
  const refreshToken = keycloak.refreshToken ?? "";

  setSessionStorage(ESSName.USER_TOKEN, token);
  setSessionStorage(ESSName.REFRESH_TOKEN, refreshToken);
};

export const keycloakAuth = (callback: Callback): void => {
  keycloak
    .init({ onLoad: initOptions.onLoad })
    .then((auth: boolean) => {
      if (!auth) {
        setTimeout(() => {
          window.location.href = PLATFORM_URLS.HRP;
        });
      } else {
        setTokensToSessionStorage();

        if (keycloak.tokenParsed) {
          const tokenParsed = keycloak.tokenParsed.sub ?? "";
          setSessionStorage(ESSName.USER_UID, tokenParsed);
        }

        let alreadyStartApp = false;

        const checkRefresh = (): void => {
          keycloak
            .updateToken(70)
            .then((refreshed: boolean) => {
              if (refreshed) {
                if (getSessionStorage(ESSName.USER_TOKEN)) {
                  setTokensToSessionStorage();
                }
                if (keycloak.tokenParsed) {
                  const tokenParsed = keycloak.tokenParsed.sub ?? "";
                  setSessionStorage(ESSName.USER_UID, tokenParsed);
                }
              }
              if (!alreadyStartApp) {
                callback();
                alreadyStartApp = true;
              }
            })
            .catch((error: Error) => {
              console.error("Error refreshing token:", error);
              if (!alreadyStartApp) {
                callback();
                alreadyStartApp = true;
              }
            });
        };

        if (!alreadyStartApp) {
          callback();
          alreadyStartApp = true;
        }

        setInterval(checkRefresh, 10000);
      }
    })
    .catch((error: Error) => {
      console.error("Keycloak initialization error:", error);
      onLogOutKeycloak();
      window.location.href = PLATFORM_URLS.HRP;
    });
};

/**
 * Выход из системы с очисткой sessionStorage и cookies
 */
export const onLogOutKeycloak = (): void => {
  clearSessionStorage();
  clearAllCookies();
  keycloak.logout();
};
`;

const VARIABLES_SCSS = `$primary-color: #1976d2;
$font-family-base: system-ui, sans-serif;
`;

const MAIN_PAGE_MODULE_SCSS = `.root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #e2e8f0;
  font-family: system-ui, -apple-system, sans-serif;
}

.rocket {
  color: #38bdf8;
}

.title {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
}

.description {
  margin: 0;
  font-size: 1rem;
  color: #94a3b8;
  text-align: center;
  max-width: 28rem;
}
`;

const APP_STYLES_INDEX = `@use "normalize";
@use "firefox";
@use "global";
`;

const NORMALIZE_SCSS = `/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
}

main {
  display: block;
}

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

hr {
  box-sizing: content-box;
  height: 0;
  overflow: visible;
}

pre {
  font-family: monospace, monospace;
  font-size: 1em;
}

a {
  background-color: transparent;
}

abbr[title] {
  border-bottom: none;
  text-decoration: underline dotted;
}

b, strong {
  font-weight: bolder;
}

code, kbd, samp {
  font-family: monospace, monospace;
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub, sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

img {
  border-style: none;
}

button, input, optgroup, select, textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}

button, input {
  overflow: visible;
}

button, select {
  text-transform: none;
}

button, [type="button"], [type="reset"], [type="submit"] {
  -webkit-appearance: button;
}

button::-moz-focus-inner, [type="button"]::-moz-focus-inner, [type="reset"]::-moz-focus-inner, [type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

button:-moz-focusring, [type="button"]:-moz-focusring, [type="reset"]:-moz-focusring, [type="submit"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}

fieldset {
  padding: 0.35em 0.75em 0.625em;
}

legend {
  box-sizing: border-box;
  color: inherit;
  display: table;
  max-width: 100%;
  padding: 0;
  white-space: normal;
}

progress {
  vertical-align: baseline;
}

textarea {
  overflow: auto;
}

[type="checkbox"], [type="radio"] {
  box-sizing: border-box;
}

[type="number"]::-webkit-inner-spin-button, [type="number"]::-webkit-outer-spin-button {
  height: auto;
}

[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}

[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}

details {
  display: block;
}

summary {
  display: list-item;
}

template {
  display: none;
}

[hidden] {
  display: none;
}
`;

const FIREFOX_SCSS = `input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
`;

const GLOBAL_SCSS = `@import url("https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap");

#root {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  &::-webkit-scrollbar {
    background-color: inherit;
    width: 16px;
  }
  &::-webkit-scrollbar-track {
    background-color: inherit;
  }
  &::-webkit-scrollbar-track:hover {
    background-color: inherit;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--user-surfaces-s-primary-color-content-surface-primary-0);
    border-radius: 16px;
    border: 5px solid var(--user-surfaces-s-main-color-content-surface-main-0);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--user-surfaces-s-primary-color-content-surface-primary-0);
    border: 4px solid var(--user-surfaces-s-main-color-content-surface-main-0);
  }
}

html {
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Roboto Flex", sans-serif;
}

body {
  background: var(--colors-surfaces-main-0, #f5f7fa);
  font-family: "Roboto Flex", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--colors-typo-main-0, #121212);
}

ul {
  list-style-type: none;
}

img {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

a {
  text-decoration: none;
  color: inherit;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

h1, h2, h3, h4, h5, h6 {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
}

h3 {
  font-size: var(--font-heading-h3-fontSize, 24px);
  font-weight: var(--font-heading-h3-fontWeight-medium, 500);
  line-height: var(--font-heading-h3-lineHeight, 30px);
  letter-spacing: var(--font-heading-h3-letterSpacing, 0.1px);
}

h4 {
  font-size: var(--font-heading-h4-fontSize, 22px);
  font-weight: var(--font-heading-h4-fontWeight-bold, 600);
  line-height: var(--font-heading-h4-lineHeight, 28px);
  letter-spacing: var(--font-heading-h4-letterSpacing, 0.1px);
}

h5 {
  font-size: var(--font-heading-h5-fontSize, 20px);
  font-weight: var(--font-heading-h5-fontWeight-bold, 600);
  line-height: var(--font-heading-h5-lineHeight, 26px);
  letter-spacing: var(--font-heading-h5-letterSpacing, 0.1px);
}

input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

button[aria-selected] {
  cursor: pointer;
}
`;

const HELPERS_INDEX_SCSS = `@forward "mixins";
`;

const MIXINS_SCSS = `@mixin flex($align-items: flex-start, $justify-items: flex-start, $gap: 0, $direction: row, $wrap: nowrap) {
  display: flex;
  align-items: $align-items;
  justify-content: $justify-items;
  flex-direction: $direction;
  gap: $gap;
  flex-wrap: $wrap;
}

@mixin font($size, $weight: 400, $line-height: initial, $color: inherit, $letter-spacing: initial) {
  font-size: $size;
  font-weight: $weight;
  line-height: $line-height;
  color: $color;
  letter-spacing: $letter-spacing;
}

@mixin size($size) {
  width: $size;
  height: $size;
}

@mixin min-size($size) {
  min-width: $size;
  min-height: $size;
}

@mixin position($position: null, $top: null, $right: null, $bottom: null, $left: null, $z-index: null) {
  $properties: (position: $position, top: $top, right: $right, bottom: $bottom, left: $left, z-index: $z-index);
  @each $property, $value in $properties {
    @if $value != null {
      #{$property}: $value;
    }
  }
}

@mixin m-x($size) {
  margin-left: $size;
  margin-right: $size;
}

@mixin p-x($size) {
  padding-left: $size;
  padding-right: $size;
}

@mixin m-y($size) {
  margin-bottom: $size;
  margin-top: $size;
}

@mixin border-y($color) {
  border-bottom: $color;
  border-top: $color;
}

@mixin border-top-radius($size) {
  border-top-left-radius: $size;
  border-top-right-radius: $size;
}

@mixin border-bottom-radius($size) {
  border-bottom-left-radius: $size;
  border-bottom-right-radius: $size;
}

@mixin p-y($size) {
  padding-bottom: $size;
  padding-top: $size;
}

@mixin max-min-width($width) {
  max-width: $width;
  min-width: $width;
}

@mixin max-min-height($height) {
  max-height: $height;
  min-height: $height;
}

@mixin line-clamp($line) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: $line;
}

@mixin visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  border: 0 !important;
  padding: 0 !important;
  white-space: nowrap !important;
  clip-path: inset(100%) !important;
  clip: rect(0 0 0 0) !important;
  overflow: hidden !important;
}

@mixin hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

$sm: 360px;
$md: 640px;
$lt: 1024px;
$lx: 1240px;
$xxl: 1440px;
$lg: 1920px;

@mixin respond-from($media) {
  @if $media == small {
    @media only screen and (max-width: $sm) {
      @content;
    }
  } @else if $media == medium {
    @media only screen and (max-width: $md) {
      @content;
    }
  } @else if $media == large {
    @media only screen and (max-width: $lt) {
      @content;
    }
  } @else if $media == extraLarge {
    @media only screen and (max-width: $lx) {
      @content;
    }
  } @else if $media == extraExtraLarge {
    @media only screen and (max-width: $xxl) {
      @content;
    }
  } @else if $media == largeDesktop {
    @media only screen and (max-width: $lg) {
      @content;
    }
  }
}
`;

const GLOBAL_D_TS = `declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const content: string;
  export default content;
}
`;

const ESLINT_CONFIG = `import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: "latest" },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      security,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "no-console": ["error", { allow: ["warn", "error", "info", "debug", "trace"] }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "max-lines": ["error", { max: 500, skipBlankLines: true, skipComments: true }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
`;

const STYLELINT_CONFIG = `/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': [
      '^[a-z][a-z0-9_]*$',
      {
        message: 'Class names should use snake_case format, not camelCase',
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    'scss/dollar-variable-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
      {
        message: 'variable-pattern should be .kebab-case',
      },
    ],
    'custom-property-pattern': [
      '^(--)?([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
      {
        message: 'CSS custom properties (used in var) must be --kebab-case',
      },
    ],
    'no-descending-specificity': null,
    'declaration-property-value-keyword-no-deprecated': null,
  },
};
`;

const PRETTIERRC = `{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 120,
  "singleQuote": false,
  "trailingComma": "none",
  "bracketSameLine": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "proseWrap": "always",
  "htmlWhitespaceSensitivity": "css",
  "plugins": ["@trivago/prettier-plugin-sort-imports"],
  "importOrder": [
    "^react$",
    "<THIRD_PARTY_MODULES>",
    "^@app/(.*)$",
    "^@pages/(.*)$",
    "^@widgets/(.*)$",
    "^@features/(.*)$",
    "^@entities/(.*)$",
    "^@shared/(.*)$",
    "^@styles/(.*)$",
    "^@games-alabuga/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true,
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "tabWidth": 2,
        "printWidth": 80
      }
    },
    {
      "files": "*.md",
      "options": {
        "printWidth": 80,
        "proseWrap": "preserve"
      }
    }
  ]
}
`;

const PRETTIERRCIGNORE = `.vscode/
*.log
*.md
dist/
node_modules/
deployments/
`;

const TSCONFIG_JSON = `{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
`;

const TSCONFIG_APP_FSD = `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@entities/*": ["./src/entities/*"],
      "@features/*": ["./src/features/*"],
      "@pages/*": ["./src/pages/*"],
      "@widgets/*": ["./src/widgets/*"],
      "@app/*": ["./src/app/*"],
      "@styles/*": ["./src/app/styles/*"],
      "@games-alabuga/*": ["./node_modules/@games-alabuga/*"]
    }
  },
  "include": ["src/**/*"]
}
`;

const TSCONFIG_APP_SIMPLE = `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@app/*": ["./src/app/*"],
      "@shared/*": ["./src/shared/*"],
      "@pages/*": ["./src/pages/*"],
      "@games-alabuga/*": ["./node_modules/@games-alabuga/*"]
    }
  },
  "include": ["src/**/*"]
}
`;

const TSCONFIG_NODE_JSON = `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["rsbuild.config.ts"]
}
`;

const TSCONFIG_NODE_FSD = TSCONFIG_NODE_JSON.replace(
  '"include": ["rsbuild.config.ts"]',
  '"include": ["steiger.config.ts", "rsbuild.config.ts"]'
);

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

React + TypeScript приложение на базе **Rsbuild** с Keycloak и приватным npm-реестром \`@games-alabuga\`.

> **Keycloak:** в \`src/index.tsx\` вызов \`keycloakAuth\` закомментирован — приложение запускается без авторизации. Для включения Keycloak раскомментируй \`keycloakAuth(startApp)\` и закомментируй \`startApp()\`.

---

## Установка

1. Установи **Gitleaks** (для pre-commit): [github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks) — \`brew install gitleaks\` / \`choco install gitleaks\`.
2. Добавь \`NPM_TOKEN\` в \`.npmrc\`.
3. \`cp .env.example .env\` и настрой переменные.
4. \`${PM_CONFIG[pm].install}\`

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
| \`${pmName} gitleaks\` | Поиск секретов в staged-файлах (пароли, API-ключи, токены) |
${fsdRows}---

## Git hooks (Husky)

- **pre-commit** — gitleaks, lint-staged (ESLint, Stylelint, Prettier для изменённых файлов)
- **pre-push** — lint, lint:style, audit, build

---

## Переменные окружения

См. \`.env.example\`. Переменные с префиксом \`APP_\` доступны в коде через \`import.meta.env.APP_*\`.
`;
};

const NPMRC = `@games-alabuga:registry=http://gitlab.alabuga.space/api/v4/projects/102/packages/npm/
//gitlab.alabuga.space/api/v4/projects/102/packages/npm/:_authToken="\${NPM_TOKEN}"
`;

const PACKAGE_JSON_TEMPLATE = (name, pm) => {
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
        "create-enterprise": `${cfg.exec} rsbuild build`,
        audit: cfg.audit,
        gitleaks: "gitleaks protect -v",
        fsd: "steiger check",
        "fsd:fix": "steiger check --fix",
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        "lint:style": 'stylelint "**/*.{css,scss}"',
        "lint:style:fix": 'stylelint "**/*.{css,scss}" --fix',
        format: "prettier --write .",
        prepare: "husky",
      },
      dependencies: {
        "@games-alabuga/ui-kit": "^1.1.3",
        "@tanstack/react-query": "^5.62.0",
        classnames: "^2.5.1",
        "keycloak-js": "^26.1.5",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^7.0.2",
        zustand: "^5.0.0-rc.2",
      },
      devDependencies: {
        "@eslint/js": "^9.21.0",
        "@feature-sliced/steiger-plugin": "^0.5.7",
        "@rsbuild/core": "^1.1.0",
        "@rsbuild/plugin-image-compress": "^1.1.0",
        "@rsbuild/plugin-react": "^1.1.0",
        "@rsbuild/plugin-sass": "^1.5.0",
        "@types/react": "^19.0.10",
        "@types/react-dom": "^19.0.4",
        "compression-webpack-plugin": "^11.0.0",
        eslint: "^9.21.0",
        "eslint-plugin-react-hooks": "^5.1.0",
        "eslint-plugin-react-refresh": "^0.4.19",
        "eslint-plugin-security": "^4.0.0",
        husky: "^9.1.7",
        "lint-staged": "^15.5.0",
        "@trivago/prettier-plugin-sort-imports": "^6.0.2",
        prettier: "^3.5.3",
        "sass-embedded": "^1.86.3",
        sharp: "^0.34.5",
        steiger: "^0.5.0",
        stylelint: "^16.20.0",
        "stylelint-config-standard-scss": "^15.0.1",
        typescript: "~5.7.2",
        "typescript-eslint": "^8.24.1",
      },
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
${PM_CONFIG[pm].run} gitleaks
${PM_CONFIG[pm].exec} lint-staged
`;

const getHuskyPrePush = (pm) => `#!/usr/bin/env sh
${PM_CONFIG[pm].run} lint
${PM_CONFIG[pm].run} lint:style
${PM_CONFIG[pm].run} audit
${PM_CONFIG[pm].run} build
`;

const ICON_ALABUGA_SVG = `<svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.3798 3.04581C7.44129 3.08012 7.50276 3.11511 7.56415 3.15041C7.60039 3.17108 7.63611 3.19216 7.67243 3.21343C7.79619 3.28538 7.92091 3.35929 8.04613 3.43508C8.07227 3.45123 8.0984 3.46682 8.12454 3.48241C8.18329 3.5182 8.24193 3.55495 8.30068 3.59121C8.34425 3.61829 8.38733 3.64503 8.4304 3.67208C8.48768 3.70787 8.54502 3.74412 8.6023 3.7809C8.64822 3.81031 8.69415 3.83962 8.74005 3.8695C8.79644 3.90568 8.85177 3.94165 8.90785 3.97871C8.95867 4.01175 9.00957 4.04576 9.06058 4.07968C9.14624 4.13671 9.232 4.19447 9.31816 4.25277C9.37828 4.29365 9.43791 4.33455 9.498 4.37589C9.54981 4.41168 9.60159 4.44804 9.65288 4.48422C9.70663 4.52147 9.7603 4.55902 9.81394 4.59715C9.86572 4.63351 9.91761 4.67075 9.96941 4.70781C10.0253 4.74781 10.0812 4.78829 10.1367 4.82906C10.1859 4.86496 10.2354 4.90033 10.2849 4.93651C10.3583 4.9908 10.4321 5.04531 10.5059 5.10051C10.5646 5.14501 10.6238 5.1891 10.6833 5.234C10.7554 5.28869 10.8273 5.34332 10.8998 5.3989C10.9457 5.43466 10.9925 5.47053 11.0383 5.50681C11.0998 5.55456 11.1617 5.60278 11.2235 5.6514C11.2703 5.68816 11.3171 5.7253 11.3639 5.76207C11.4295 5.81431 11.4951 5.86685 11.5606 5.9195C11.6023 5.9535 11.6441 5.98655 11.6858 6.02055C11.7702 6.08899 11.8545 6.15837 11.9389 6.22808C12.0223 6.15878 12.1059 6.09044 12.1897 6.02231C12.2339 5.98616 12.2783 5.95075 12.3228 5.91538C12.3851 5.86449 12.4479 5.81431 12.5108 5.76441C12.5599 5.72589 12.6085 5.68717 12.6571 5.64866C12.7162 5.60239 12.7754 5.5564 12.8345 5.50995C12.8828 5.47229 12.9317 5.43466 12.9804 5.39713C13.0473 5.34565 13.1142 5.29469 13.1812 5.24422C13.2505 5.19185 13.3198 5.1399 13.388 5.08795C13.4559 5.03795 13.5233 4.98748 13.5907 4.93789C13.6421 4.90033 13.6939 4.86309 13.7452 4.82543C13.7989 4.78681 13.8521 4.7483 13.9054 4.71018C13.9589 4.67163 14.0126 4.63302 14.0663 4.59538C14.1176 4.55863 14.1684 4.52284 14.2199 4.48747C14.2735 4.44931 14.3277 4.41168 14.3812 4.37454C14.4349 4.33777 14.4881 4.30151 14.5418 4.26473C14.6372 4.20005 14.7326 4.13583 14.8275 4.07291C14.8743 4.04174 14.9211 4.01046 14.9678 3.97959C15.0255 3.94165 15.0833 3.90441 15.1412 3.86716C15.1847 3.83863 15.2288 3.8107 15.2728 3.78266C15.3315 3.74511 15.39 3.70787 15.4489 3.67062C15.4902 3.64503 15.531 3.61974 15.5716 3.59445C15.6327 3.55671 15.6937 3.51859 15.7543 3.48153C15.7703 3.47193 15.7858 3.46262 15.8019 3.453C15.9391 3.36949 16.0757 3.28862 16.2118 3.20962C16.2449 3.1904 16.2784 3.17058 16.3119 3.15139C16.3747 3.11511 16.4375 3.07973 16.5003 3.04433C16.5302 3.02747 16.5603 3.01043 16.5903 2.99347C15.5287 2.05411 14.4711 1.21278 13.435 0.477862C12.5371 -0.159076 11.3406 -0.159154 10.4427 0.477736C9.43237 1.19428 8.40175 2.01197 7.36706 2.92306C7.32793 2.95751 7.3343 3.02037 7.3798 3.04581Z" fill="#1E2790"/>
<path d="M20.3979 7.01322C20.3337 7.04821 20.2691 7.08408 20.2043 7.12026C20.1709 7.13859 20.1374 7.15742 20.104 7.17633C20.0407 7.21212 19.9765 7.24848 19.9123 7.28513C19.8806 7.30347 19.8489 7.3224 19.8168 7.34071C19.6743 7.42334 19.5316 7.50826 19.3876 7.59558C19.3776 7.60196 19.3674 7.60793 19.357 7.61431C19.2955 7.65204 19.2336 7.69056 19.1717 7.72871C19.1313 7.7534 19.0914 7.7783 19.0515 7.80348C18.9924 7.84065 18.9331 7.87838 18.8735 7.91651C18.8306 7.94397 18.7874 7.97152 18.7438 7.99955C18.6856 8.03719 18.6273 8.07492 18.5691 8.11344C18.5237 8.14324 18.4778 8.17353 18.4325 8.20382C18.3344 8.2691 18.2362 8.33519 18.1375 8.40223C18.0862 8.43711 18.0348 8.47202 17.984 8.5074C17.9295 8.54495 17.8748 8.58318 17.8198 8.6217C17.7698 8.6565 17.7194 8.69198 17.6684 8.72777C17.6148 8.76629 17.5607 8.80491 17.5065 8.84342C17.4534 8.88157 17.4006 8.9197 17.348 8.95821C17.2961 8.99587 17.2443 9.03311 17.192 9.07163C17.1251 9.12075 17.0576 9.17073 16.9903 9.22123C16.9215 9.27279 16.8527 9.32463 16.7834 9.37689C16.7165 9.42796 16.649 9.47892 16.5821 9.53038C16.5335 9.56804 16.4848 9.60557 16.4363 9.6433C16.3772 9.68918 16.318 9.73506 16.2588 9.78193C16.2102 9.82044 16.1612 9.85916 16.112 9.89768C16.0635 9.93671 16.0148 9.97572 15.9662 10.0146C16.0658 10.1203 16.1652 10.2265 16.2648 10.3334C16.2955 10.3668 16.3267 10.4009 16.3575 10.4344C16.435 10.5184 16.5128 10.603 16.5899 10.6878C16.6271 10.7277 16.6637 10.7686 16.7004 10.8091C16.7761 10.8926 16.8519 10.9771 16.9274 11.0616C16.9599 11.0983 16.9931 11.135 17.026 11.1717C17.1329 11.2925 17.2392 11.4133 17.3461 11.5354C17.4525 11.6575 17.5579 11.7801 17.6626 11.9028C17.6951 11.9409 17.7272 11.9789 17.7602 12.0171C17.8331 12.1033 17.9061 12.1898 17.9784 12.2761C18.0142 12.3182 18.0495 12.3609 18.0853 12.4037C18.1587 12.4918 18.2317 12.5799 18.3045 12.6685C18.3344 12.7049 18.3647 12.7411 18.3939 12.7769C18.4944 12.9 18.5943 13.023 18.6934 13.1461C18.7075 13.1641 18.7213 13.1819 18.7356 13.1993C18.8204 13.3054 18.9052 13.412 18.9887 13.5179C19.0218 13.5597 19.0539 13.6012 19.0863 13.6424C19.1524 13.7274 19.2183 13.8118 19.2835 13.8968C19.318 13.9409 19.3519 13.9845 19.3853 14.0285C19.4257 14.0812 19.4655 14.1333 19.5053 14.186C19.5085 14.1902 19.5144 14.1912 19.5184 14.1878C19.5848 14.1342 19.6514 14.0805 19.7178 14.0276C19.764 13.9909 19.81 13.9546 19.8559 13.9188C19.9191 13.8693 19.982 13.8201 20.0447 13.7715C20.0897 13.736 20.1351 13.7006 20.18 13.6657C20.2553 13.6084 20.33 13.5515 20.4048 13.4951C20.4584 13.4547 20.512 13.4138 20.5658 13.3738C20.6432 13.316 20.7203 13.2585 20.7978 13.2017C20.8455 13.1668 20.8932 13.1319 20.9408 13.0974C20.9986 13.0557 21.0559 13.0139 21.1132 12.973C21.1641 12.9366 21.2147 12.9005 21.2655 12.8642C21.3206 12.8252 21.3755 12.7871 21.4305 12.7485C21.481 12.713 21.5314 12.6778 21.5815 12.6428C21.6456 12.5988 21.7093 12.5556 21.7732 12.512C21.8534 12.4573 21.9336 12.4037 22.0134 12.3504C22.0671 12.3146 22.1211 12.2788 22.1749 12.2439C22.2289 12.2081 22.2835 12.1727 22.3376 12.1378C22.3859 12.1071 22.4335 12.0763 22.4807 12.0459C22.5366 12.0101 22.5926 11.9748 22.6485 11.9394C22.6935 11.911 22.7389 11.883 22.7838 11.855C22.8412 11.8196 22.898 11.7844 22.9549 11.7498C22.9901 11.7282 23.025 11.7071 23.0603 11.686C23.1746 11.6171 23.2887 11.5497 23.4016 11.4835C23.4409 11.4611 23.4799 11.4382 23.5184 11.4156C23.5785 11.3811 23.6381 11.3472 23.6981 11.3137C23.7362 11.2921 23.7744 11.2705 23.8129 11.2494C23.8804 11.212 23.8999 11.1234 23.8547 11.0608C22.9668 9.8317 21.9956 8.60537 20.9478 7.40267C20.8115 7.24612 20.6744 7.09183 20.5378 6.93803C20.5186 6.94851 20.4992 6.95871 20.4799 6.96931C20.4525 6.98402 20.4254 6.99813 20.3979 7.01322Z" fill="#00A1E9"/>
<path d="M11.9952 6.27451C12.0255 6.29941 12.0553 6.32501 12.0855 6.3503C12.1633 6.41508 12.2419 6.48067 12.3198 6.54733C12.362 6.5826 12.4037 6.6185 12.4454 6.65426C12.5142 6.71259 12.5821 6.77131 12.6504 6.83052C12.6927 6.86688 12.7348 6.90314 12.7765 6.9402C12.8518 7.00548 12.9265 7.07157 13.0017 7.13822C13.0352 7.16763 13.0686 7.19704 13.1021 7.22723C13.2085 7.32143 13.3144 7.4169 13.4204 7.51384C13.4498 7.54001 13.4791 7.56707 13.5079 7.59373C13.5882 7.66666 13.668 7.74019 13.7478 7.81449C13.7872 7.85075 13.8262 7.8875 13.8657 7.92378C13.9376 7.99171 14.0102 8.05963 14.0825 8.12816C14.1211 8.16444 14.1596 8.20119 14.198 8.23786C14.282 8.31775 14.3664 8.39861 14.4504 8.48036C14.4751 8.50378 14.4994 8.52702 14.5237 8.55104C14.6319 8.65563 14.7392 8.76169 14.847 8.86833C14.8764 8.89756 14.9061 8.92697 14.9355 8.95636C15.0153 9.03637 15.0951 9.11625 15.1753 9.19701C15.2125 9.23467 15.2492 9.27231 15.2867 9.30994C15.362 9.3866 15.4371 9.46335 15.5124 9.5409C15.5472 9.57726 15.5821 9.61305 15.6174 9.6492C15.7114 9.74714 15.8059 9.84574 15.8999 9.94495C15.9137 9.95965 15.9279 9.97397 15.942 9.98906C15.9498 9.99718 15.958 10.0059 15.9662 10.0146C16.0148 9.97572 16.0635 9.93671 16.112 9.89768C16.1612 9.85916 16.2102 9.82044 16.2588 9.78193C16.318 9.73506 16.3772 9.68918 16.4363 9.6433C16.4848 9.60557 16.5335 9.56804 16.5821 9.53038C16.649 9.47892 16.7165 9.42796 16.7834 9.37689C16.8527 9.32463 16.9215 9.27279 16.9903 9.22123C17.0576 9.17073 17.1251 9.12075 17.192 9.07163C17.2443 9.03311 17.2961 8.99587 17.348 8.95821C17.4006 8.9197 17.4534 8.88157 17.5065 8.84342C17.5607 8.80491 17.6148 8.76629 17.6684 8.72777C17.7194 8.69198 17.7698 8.6565 17.8198 8.6217C17.8748 8.58318 17.9295 8.54495 17.984 8.5074C18.0348 8.47202 18.0862 8.43711 18.1375 8.40223C18.2362 8.33519 18.3344 8.2691 18.4325 8.20382C18.4778 8.17353 18.5237 8.14324 18.5691 8.11344C18.6273 8.07492 18.6856 8.03719 18.7438 7.99955C18.7874 7.97152 18.8306 7.94397 18.8735 7.91651C18.9331 7.87838 18.9924 7.84065 19.0515 7.80348C19.0914 7.7783 19.1313 7.7534 19.1717 7.72871C19.2336 7.69056 19.2955 7.65204 19.357 7.61431C19.3674 7.60793 19.3776 7.60196 19.3876 7.59558C19.5316 7.50826 19.6743 7.42334 19.8168 7.34071C19.8489 7.3224 19.8806 7.30347 19.9123 7.28513C19.9765 7.24848 20.0407 7.21212 20.104 7.17633C20.1374 7.15742 20.1709 7.13859 20.2043 7.12026C20.2691 7.08408 20.3337 7.04821 20.3979 7.01322C20.4254 6.99813 20.4525 6.98402 20.4799 6.96931C20.4992 6.95871 20.5186 6.94851 20.5378 6.93803C19.2392 5.48258 17.9113 4.16252 16.5903 2.99347C16.5603 3.01043 16.5302 3.02747 16.5003 3.04433C16.4375 3.07973 16.3747 3.11511 16.3119 3.15139C16.2784 3.17058 16.2449 3.1904 16.2118 3.20962C16.0757 3.28862 15.9391 3.36949 15.8019 3.453C15.7858 3.46262 15.7703 3.47193 15.7543 3.48153C15.6937 3.51859 15.6327 3.55671 15.5716 3.59445C15.531 3.61974 15.4902 3.64503 15.4489 3.67062C15.39 3.70787 15.3315 3.74511 15.2728 3.78266C15.2288 3.8107 15.1847 3.83863 15.1412 3.86716C15.0833 3.90441 15.0255 3.94165 14.9678 3.97959C14.9211 4.01046 14.8743 4.04174 14.8275 4.07291C14.7326 4.13583 14.6372 4.20005 14.5418 4.26473C14.4881 4.30151 14.4349 4.33777 14.3812 4.37454C14.3277 4.41168 14.2735 4.44931 14.2199 4.48747C14.1684 4.52284 14.1176 4.55863 14.0663 4.59538C14.0126 4.63302 13.9589 4.67163 13.9054 4.71018C13.8521 4.7483 13.7989 4.78681 13.7452 4.82543C13.6939 4.86309 13.6421 4.90033 13.5907 4.93789C13.5233 4.98748 13.4559 5.03795 13.388 5.08795C13.3198 5.1399 13.2505 5.19185 13.1812 5.24422C13.1142 5.29469 13.0473 5.34565 12.9804 5.39713C12.9317 5.43466 12.8828 5.47229 12.8345 5.50995C12.7754 5.5564 12.7162 5.60239 12.6571 5.64866C12.6085 5.68717 12.5599 5.72589 12.5108 5.76441C12.4479 5.81431 12.3851 5.86449 12.3228 5.91538C12.2783 5.95075 12.2339 5.98616 12.1897 6.02231C12.1059 6.09044 12.0223 6.15878 11.9389 6.22808C11.9573 6.24336 11.9763 6.25892 11.9952 6.27451Z" fill="#0065B7"/>
<path d="M0.181272 11.3137C0.240798 11.3472 0.299929 11.3807 0.359942 11.4151C0.399006 11.4377 0.438457 11.4605 0.477522 11.4835C0.589814 11.5491 0.702597 11.6158 0.815869 11.6841C0.852094 11.7058 0.887828 11.7273 0.924149 11.7493C0.980932 11.7838 1.03791 11.8192 1.09469 11.8544C1.13963 11.8825 1.18545 11.911 1.23088 11.9394C1.28639 11.9743 1.34229 12.0097 1.3978 12.0455C1.44548 12.0759 1.49325 12.1066 1.54132 12.1372C1.59537 12.1727 1.64999 12.2075 1.70404 12.2434C1.75779 12.2788 1.81182 12.3146 1.86547 12.3504C1.94585 12.4037 2.02554 12.4573 2.10582 12.512C2.16956 12.5552 2.23319 12.5988 2.29742 12.6428C2.34754 12.6773 2.39796 12.7127 2.44838 12.748C2.5034 12.7867 2.55842 12.8252 2.61383 12.8642C2.66444 12.9 2.71487 12.9363 2.76567 12.9725C2.82294 13.0139 2.88081 13.0552 2.93819 13.0969C2.98585 13.1319 3.03343 13.1663 3.08112 13.2017C3.15865 13.2585 3.23659 13.3165 3.31412 13.3742C3.36738 13.4138 3.42006 13.4538 3.47332 13.4941C3.54849 13.5506 3.62369 13.608 3.69888 13.6657C3.74383 13.7006 3.78923 13.7356 3.83418 13.7705C3.89694 13.8196 3.95988 13.8688 4.02304 13.9185C4.06894 13.9546 4.11486 13.9909 4.16107 14.0276C4.22765 14.0805 4.29404 14.1337 4.361 14.1874C4.36487 14.1905 4.37029 14.1898 4.37328 14.1859C4.41285 14.1335 4.45275 14.0814 4.49266 14.029C4.52703 13.9849 4.56149 13.9399 4.59596 13.8959C4.66085 13.8114 4.72607 13.7274 4.79205 13.6434C4.82466 13.6012 4.85717 13.5593 4.89074 13.5175C4.97327 13.4123 5.05668 13.3073 5.14107 13.2021C5.15614 13.1834 5.17083 13.1644 5.18601 13.1456C5.2846 13.0226 5.38456 12.9 5.48452 12.7769C5.51477 12.7407 5.54472 12.7039 5.57487 12.6677C5.64742 12.5795 5.72026 12.4913 5.79318 12.4037C5.82893 12.3609 5.86475 12.3182 5.9005 12.2752C5.97285 12.1892 6.04579 12.1033 6.11871 12.0171C6.15083 11.9789 6.18383 11.9404 6.21641 11.9023C6.32098 11.7796 6.42644 11.6575 6.53285 11.5354C6.63915 11.4133 6.74608 11.2925 6.85249 11.1722C6.88588 11.1347 6.91945 11.0974 6.95284 11.0602C7.02765 10.9762 7.10282 10.8926 7.17763 10.81C7.21521 10.7686 7.25233 10.7274 7.28953 10.6865C7.36607 10.6024 7.44264 10.5189 7.51968 10.4357C7.55131 10.4013 7.58294 10.3668 7.61506 10.3325C7.71403 10.2259 7.81311 10.1198 7.91268 10.0146C7.86313 9.97522 7.81399 9.93523 7.76503 9.89623C7.71735 9.85818 7.66958 9.82104 7.62239 9.7833C7.56092 9.73566 7.50041 9.68781 7.4399 9.64097C7.39262 9.60429 7.34543 9.56744 7.29862 9.53126C7.22804 9.47698 7.15745 9.42334 7.08725 9.37051C7.02451 9.32276 6.96204 9.27553 6.8993 9.22906C6.82773 9.17584 6.75655 9.12262 6.68557 9.07025C6.63465 9.03312 6.58473 8.99636 6.53412 8.96008C6.47969 8.92058 6.42506 8.88108 6.37051 8.84215C6.31775 8.80402 6.26509 8.76629 6.21232 8.72915C6.16002 8.69198 6.10775 8.65523 6.05537 8.61895C6.00222 8.5817 5.94964 8.54464 5.89687 8.50828C5.84077 8.46977 5.78546 8.43203 5.72995 8.3939C5.63724 8.33106 5.54511 8.2691 5.45289 8.20805C5.40482 8.17589 5.35656 8.14373 5.30887 8.11248C5.2516 8.07492 5.19422 8.03768 5.13695 8.00101C5.09242 7.97191 5.04797 7.94356 5.00352 7.91506C4.94527 7.87779 4.88711 7.84065 4.82886 7.80389C4.78715 7.7777 4.74574 7.75252 4.70403 7.72684C4.64401 7.6891 4.58343 7.65155 4.52302 7.6148C4.50598 7.60429 4.48906 7.5941 4.47202 7.58391C4.33631 7.50128 4.20102 7.4215 4.06622 7.34286C4.03223 7.32328 3.99876 7.30347 3.96538 7.28425C3.90202 7.24789 3.83928 7.21251 3.77633 7.17721C3.74206 7.15742 3.70759 7.13821 3.67363 7.11888C3.60939 7.08351 3.54577 7.04821 3.48202 7.01382C3.45306 6.99813 3.42475 6.98303 3.39626 6.96745C3.37797 6.95725 3.35955 6.94763 3.34124 6.93803C3.20408 7.09134 3.06742 7.24612 2.93124 7.40218C1.88329 8.60496 0.91213 9.83183 0.0240744 11.0611C-0.0209607 11.1234 -0.0011617 11.2115 0.0660419 11.2488C0.104126 11.2705 0.142601 11.2921 0.181272 11.3137Z" fill="#00A1E9"/>
<path d="M15.4861 17.7781C15.4531 17.7357 15.4201 17.6931 15.3866 17.6507C15.3045 17.546 15.2216 17.4418 15.1376 17.3372C15.122 17.3179 15.1069 17.2986 15.0918 17.2793C14.9932 17.1563 14.8932 17.0337 14.7933 16.911C14.763 16.8744 14.7327 16.8377 14.7024 16.801C14.6301 16.7132 14.5576 16.6255 14.4842 16.5374C14.4488 16.4946 14.4131 16.4519 14.3773 16.4093C14.3049 16.3229 14.232 16.237 14.1586 16.1508C14.1265 16.1126 14.094 16.0746 14.061 16.036C13.9564 15.9138 13.8509 15.7913 13.745 15.6692C13.6386 15.5469 13.5317 15.4262 13.4249 15.3059C13.3919 15.2687 13.3583 15.232 13.3253 15.1948C13.2503 15.1103 13.175 15.0263 13.0993 14.9432C13.0627 14.9023 13.0255 14.8614 12.9887 14.8212C12.9117 14.7367 12.8343 14.6526 12.7571 14.569C12.7256 14.535 12.6943 14.5005 12.6627 14.4666C12.5559 14.3514 12.4485 14.2366 12.3408 14.1227C12.3262 14.1072 12.3115 14.0921 12.2964 14.0764C12.2033 13.9782 12.1102 13.8808 12.0166 13.7838C11.9747 13.7394 11.9046 13.7396 11.8619 13.7832C11.8615 13.7836 11.8611 13.784 11.8607 13.7844C11.769 13.8798 11.6774 13.9758 11.5855 14.0726C11.5696 14.0897 11.5535 14.1062 11.537 14.1232C11.4298 14.2366 11.3229 14.3509 11.2161 14.4662C11.1839 14.5005 11.1522 14.5354 11.1201 14.5704C11.0435 14.6534 10.967 14.7367 10.8904 14.8206C10.8532 14.8614 10.8156 14.9023 10.779 14.9432C10.7037 15.0267 10.6281 15.1103 10.5533 15.1944C10.5203 15.2316 10.4868 15.2687 10.4538 15.3059C10.3469 15.4262 10.24 15.5469 10.1337 15.6692C10.0274 15.7913 9.92237 15.9138 9.81731 16.036C9.78472 16.0741 9.75221 16.1126 9.72009 16.1508C9.64676 16.237 9.57335 16.3235 9.5009 16.4101C9.46557 16.4524 9.43021 16.4942 9.39498 16.5365C9.32067 16.625 9.24734 16.7142 9.17439 16.8032C9.14502 16.839 9.11526 16.8748 9.08591 16.9106C8.98507 17.0337 8.88511 17.1568 8.78642 17.2803C8.77222 17.2977 8.75901 17.3152 8.74471 17.3321C8.65944 17.4387 8.57466 17.5458 8.49065 17.6522C8.45853 17.6936 8.42644 17.7343 8.39432 17.7757C8.36457 17.8134 8.36736 17.8678 8.40088 17.9022C8.4054 17.9068 8.40994 17.9115 8.4145 17.9161C8.50865 18.014 8.60255 18.1122 8.69653 18.2114C8.71073 18.2261 8.72502 18.2408 8.73883 18.2555C8.84661 18.3692 8.95432 18.4846 9.06161 18.5998C9.09275 18.6337 9.12398 18.6677 9.15522 18.7013C9.23265 18.7854 9.3101 18.8699 9.38763 18.9543C9.42384 18.9946 9.46057 19.0351 9.49717 19.0755C9.57335 19.1596 9.64863 19.2435 9.72432 19.3285C9.75732 19.3652 9.7898 19.4019 9.82329 19.4388C9.93019 19.5594 10.0365 19.6801 10.1429 19.8024C10.2493 19.9245 10.3543 20.0465 10.4594 20.1688C10.4919 20.2073 10.5249 20.2458 10.5575 20.2845C10.6304 20.3702 10.7033 20.4567 10.7752 20.5425C10.8111 20.5851 10.8469 20.6274 10.8826 20.6701C10.9559 20.7582 11.0289 20.8464 11.1014 20.9351C11.1316 20.9713 11.1614 21.0076 11.1912 21.0443C11.2916 21.1669 11.3917 21.2895 11.4902 21.4126C11.5053 21.4313 11.52 21.4503 11.5346 21.469C11.6191 21.5742 11.7025 21.6793 11.7855 21.7844C11.8185 21.8268 11.8511 21.8685 11.8841 21.9103C11.9121 21.9458 11.9668 21.9459 11.9947 21.9103C12.0272 21.868 12.0602 21.8263 12.0931 21.7844C12.1763 21.6789 12.2601 21.5732 12.3444 21.4677C12.3591 21.4497 12.3738 21.4313 12.3885 21.413C12.4872 21.29 12.5866 21.1669 12.6871 21.0443C12.7169 21.0076 12.7471 20.9713 12.7769 20.9351C12.8498 20.8464 12.9228 20.7582 12.9961 20.6701C13.0319 20.6274 13.0672 20.5851 13.1029 20.5425C13.175 20.4567 13.2479 20.3702 13.3208 20.2845C13.3538 20.2458 13.3864 20.2073 13.4194 20.1688C13.524 20.0465 13.6294 19.9245 13.7353 19.8024C13.8418 19.6801 13.9487 19.5594 14.0555 19.4388C14.0885 19.4019 14.1215 19.3652 14.154 19.3285C14.2297 19.2435 14.3053 19.1596 14.381 19.0755C14.4177 19.0351 14.4548 18.9946 14.491 18.9543C14.5686 18.8699 14.6456 18.7854 14.7237 18.7013C14.7547 18.6677 14.7858 18.6337 14.8171 18.5998C14.9245 18.4846 15.0323 18.3692 15.1395 18.2555C15.1538 18.2408 15.1679 18.2261 15.1816 18.2114C15.2762 18.1122 15.3696 18.014 15.4642 17.9161C15.4694 17.9107 15.4746 17.9053 15.4798 17.9C15.5119 17.8667 15.5147 17.8145 15.4861 17.7781Z" fill="#00D1F9"/>
<path d="M3.48202 7.01382C3.54577 7.04821 3.60939 7.08351 3.67363 7.11888C3.70761 7.13821 3.74157 7.15799 3.77633 7.17721C3.83928 7.21251 3.90202 7.24789 3.96538 7.28425C3.99876 7.30347 4.03223 7.32328 4.06622 7.34286C4.20102 7.4215 4.33584 7.50187 4.47202 7.58391C4.48906 7.5941 4.50598 7.60429 4.52302 7.6148C4.58343 7.65155 4.64401 7.6891 4.70403 7.72684C4.74574 7.75252 4.78715 7.7777 4.82886 7.80389C4.88711 7.84065 4.94527 7.87779 5.00352 7.91506C5.04797 7.94356 5.09242 7.97191 5.13695 8.00101C5.19422 8.03768 5.2516 8.07492 5.30887 8.11248C5.35656 8.14373 5.40482 8.17589 5.45289 8.20805C5.54511 8.2691 5.63724 8.33106 5.72995 8.3939C5.78546 8.43203 5.84077 8.46977 5.89687 8.50828C5.94964 8.54464 6.00222 8.5817 6.05537 8.61895C6.10775 8.65523 6.16002 8.69198 6.21232 8.72915C6.26509 8.76629 6.31775 8.80402 6.37051 8.84215C6.42506 8.88108 6.47969 8.92058 6.53412 8.96008C6.58473 8.99636 6.63465 9.03312 6.68557 9.07025C6.75655 9.12262 6.82773 9.17584 6.8993 9.22906C6.96204 9.27553 7.02451 9.32276 7.08725 9.37051C7.15745 9.42334 7.22804 9.47698 7.29862 9.53126C7.34543 9.56744 7.39262 9.60429 7.4399 9.64097C7.50041 9.68781 7.56092 9.73566 7.62239 9.7833C7.66958 9.82104 7.71735 9.85818 7.76503 9.89623C7.81399 9.93523 7.86313 9.97522 7.91268 10.0146C7.92051 10.0065 7.92879 9.99778 7.93661 9.98945C7.95278 9.97288 7.96873 9.95641 7.9843 9.93945C8.07652 9.8426 8.16865 9.74615 8.26048 9.65068C8.29708 9.61305 8.33332 9.57529 8.37003 9.53765C8.44346 9.46247 8.51679 9.3871 8.59013 9.3123C8.62869 9.27319 8.66716 9.23379 8.70612 9.19476C8.78367 9.11625 8.86159 9.03813 8.93964 8.96059C8.97085 8.92931 9.00237 8.89813 9.03361 8.86688C9.14041 8.7613 9.24734 8.65613 9.35414 8.55241C9.38116 8.52614 9.40828 8.49997 9.43579 8.4738C9.51694 8.39537 9.59763 8.31686 9.67928 8.23971C9.7195 8.20119 9.75945 8.16306 9.79988 8.12494C9.86998 8.05836 9.94017 7.99269 10.0104 7.92703C10.0516 7.88888 10.0923 7.85036 10.1337 7.81223C10.2108 7.74107 10.2874 7.67039 10.3643 7.60011C10.3964 7.5707 10.4281 7.54129 10.4602 7.51198C10.5653 7.4169 10.6701 7.32242 10.7752 7.22868C10.8114 7.19595 10.8481 7.164 10.8853 7.13135C10.9564 7.06793 11.0284 7.00509 11.0999 6.94256C11.144 6.90405 11.1884 6.8654 11.2325 6.82738C11.298 6.77043 11.3635 6.71386 11.4296 6.658C11.4736 6.62036 11.5177 6.58221 11.5616 6.54497C11.6359 6.48213 11.7102 6.42019 11.7841 6.35805C11.8179 6.3297 11.852 6.30117 11.886 6.27324C11.9141 6.24976 11.9142 6.20649 11.8859 6.18317C11.8197 6.12861 11.7536 6.07433 11.6873 6.02063C11.6456 5.98663 11.6038 5.95358 11.5621 5.91958C11.4966 5.86693 11.431 5.81439 11.3654 5.76215C11.3186 5.72491 11.2718 5.68824 11.225 5.65149C11.1632 5.60286 11.1017 5.55464 11.0402 5.5069C10.994 5.47061 10.9472 5.43425 10.9013 5.39898C10.8288 5.3434 10.7569 5.28878 10.6848 5.23408C10.6257 5.18918 10.5666 5.14509 10.5074 5.10059C10.4336 5.0454 10.3598 4.99088 10.2864 4.9366C10.2369 4.90042 10.1874 4.86504 10.1382 4.82915C10.0827 4.78837 10.0268 4.74789 9.97092 4.7079C9.91914 4.67083 9.86725 4.63359 9.81545 4.59723C9.7618 4.5591 9.70816 4.52155 9.65441 4.48431C9.60309 4.44813 9.55131 4.41176 9.49953 4.37597C9.43941 4.33463 9.37978 4.29373 9.31969 4.25286C9.23353 4.19455 9.14777 4.13679 9.06211 4.07976C9.01108 4.04584 8.96018 4.01184 8.90938 3.97841C8.85328 3.94173 8.79797 3.90576 8.74158 3.86958C8.69565 3.8397 8.64973 3.81039 8.60383 3.78098C8.54656 3.74421 8.48918 3.70795 8.43191 3.67216C8.38883 3.64511 8.34575 3.61837 8.30268 3.59129C8.24344 3.55503 8.18479 3.51828 8.12656 3.48249C8.09993 3.46641 8.07377 3.45074 8.04764 3.43516C7.92242 3.35937 7.7977 3.28546 7.67396 3.21351C7.63764 3.19224 7.60189 3.17116 7.56568 3.15049C7.50429 3.11519 7.4428 3.0802 7.38133 3.04589C7.32608 3.01442 7.25698 3.02205 7.20946 3.06429C5.91449 4.2153 4.61438 5.51171 3.34124 6.93803C3.35955 6.94763 3.37797 6.95725 3.39626 6.96745C3.42475 6.98303 3.45306 6.99813 3.48202 7.01382Z" fill="#0065B7"/>
</svg>`;

const ROCKET_SVG_FILE =
  '<svg width="64" height="100" viewBox="0 0 64 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M32 0L24 32h16L32 0z" fill="#7dd3fc"/>' +
  '<rect x="24" y="32" width="16" height="36" rx="2" fill="#38bdf8"/>' +
  '<circle cx="32" cy="48" r="5" fill="#0ea5e9" stroke="#0284c7" stroke-width="1.5"/>' +
  '<path d="M24 68L16 88h16L24 68z" fill="#0ea5e9"/>' +
  '<path d="M40 68L48 88H32L40 68z" fill="#0ea5e9"/>' +
  '<rect x="20" y="68" width="24" height="6" fill="#0284c7"/>' +
  '<path d="M28 74L32 96L36 74H28z" fill="#fbbf24" opacity="0.9"/>' +
  "</svg>";

const FSD_LAYER_GITIGNORE = `# FSD layer - add slices with public API (index.ts)
`;

module.exports = {
  PRESETS,
  PM_CONFIG,
  RSBUILD_BASE,
  RSBUILD_ALIASES_FSD,
  RSBUILD_ALIASES_SIMPLE,
  SASS_ADDITIONAL_FN,
  STEIGER_CONFIG,
  APP_FSD,
  APP_SIMPLE,
  INDEX_TSX_FSD,
  INDEX_TSX_SIMPLE,
  ROUTES_FSD,
  MAIN_PAGE_INDEX,
  MAIN_PAGE_UI,
  CONFIG_TS,
  COOKIE_INDEX,
  SESSION_STORAGE_INDEX,
  KEYCLOAK_INDEX_FSD,
  KEYCLOAK_INDEX_SIMPLE,
  VARIABLES_SCSS,
  MAIN_PAGE_MODULE_SCSS,
  APP_STYLES_INDEX,
  NORMALIZE_SCSS,
  FIREFOX_SCSS,
  GLOBAL_SCSS,
  HELPERS_INDEX_SCSS,
  MIXINS_SCSS,
  GLOBAL_D_TS,
  ESLINT_CONFIG,
  STYLELINT_CONFIG,
  PRETTIERRC,
  PRETTIERRCIGNORE,
  TSCONFIG_JSON,
  TSCONFIG_APP_FSD,
  TSCONFIG_APP_SIMPLE,
  TSCONFIG_NODE_JSON,
  TSCONFIG_NODE_FSD,
  GITIGNORE_BASE,
  getGitignore,
  README_TEMPLATE,
  NPMRC,
  PACKAGE_JSON_TEMPLATE,
  ENV_EXAMPLE,
  INDEX_HTML_TEMPLATE,
  getHuskyPreCommit,
  getHuskyPrePush,
  ICON_ALABUGA_SVG,
  ROCKET_SVG_FILE,
  FSD_LAYER_GITIGNORE,
};
