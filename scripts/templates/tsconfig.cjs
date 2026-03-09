/**
 * Шаблоны tsconfig.
 */
const { buildScopePaths } = require("./scope.cjs");

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
      ${buildScopePaths()}
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
      ${buildScopePaths()}
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

module.exports = {
  TSCONFIG_JSON,
  TSCONFIG_APP_FSD,
  TSCONFIG_APP_SIMPLE,
  TSCONFIG_NODE_JSON,
  TSCONFIG_NODE_FSD,
};
