/**
 * Шаблоны Rsbuild и Steiger.
 */
const { buildScopeAliases } = require("./scope.cjs");

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
      ${buildScopeAliases()}`;

const RSBUILD_ALIASES_SIMPLE = `"@app": path.resolve(__dirname, "src/app"),
      "@pages": path.resolve(__dirname, "src/pages"),
      ${buildScopeAliases()}`;

const SASS_ADDITIONAL_FN = [
  "(content, loaderContext) => {",
  '  const contentStr = typeof content === "string" ? content : content.toString("utf-8");',
  '  const helpersPath = path.resolve(__dirname, "src/app/styles/helpers").replace(/\\\\/g, "/");',
  '  return `@use "${helpersPath}/index" as *;\\n${contentStr}`;',
  "}",
].join("\n");

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

module.exports = {
  RSBUILD_BASE,
  RSBUILD_ALIASES_FSD,
  RSBUILD_ALIASES_SIMPLE,
  SASS_ADDITIONAL_FN,
  STEIGER_CONFIG,
};
