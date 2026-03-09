/**
 * Шаблоны shared: config, cookie, sessionStorage, keycloak.
 */
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

const KEYCLOAK_INDEX = `import Keycloak, { type KeycloakOnLoad } from "keycloak-js";

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

module.exports = {
  CONFIG_TS,
  COOKIE_INDEX,
  SESSION_STORAGE_INDEX,
  KEYCLOAK_INDEX_FSD: KEYCLOAK_INDEX,
  KEYCLOAK_INDEX_SIMPLE: KEYCLOAK_INDEX,
};
