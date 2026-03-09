/**
 * Шаблоны App, index, routes, main page.
 */
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

module.exports = {
  APP_FSD,
  APP_SIMPLE,
  INDEX_TSX_FSD,
  INDEX_TSX_SIMPLE,
  ROUTES_FSD,
  MAIN_PAGE_INDEX,
  MAIN_PAGE_UI,
  MAIN_PAGE_MODULE_SCSS,
};
