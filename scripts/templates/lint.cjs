/**
 * Шаблоны ESLint, Stylelint, Prettier.
 */
const { buildScopeImportOrder } = require("./scope.cjs");

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
      ...reactRefresh.configs.recommended.rules,
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
    "^@styles/(.*)$"${buildScopeImportOrder()},
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

module.exports = {
  ESLINT_CONFIG,
  STYLELINT_CONFIG,
  PRETTIERRC,
  PRETTIERRCIGNORE,
};
