#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const {
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
} = require("./constants.cjs");

const PRESET_DIR = path.resolve(__dirname, "..");
let ROOT;

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
};

function log(msg, color = "") {
  console.log(color ? `${color}${msg}${c.reset}` : msg);
}

function logEmpty(lines = 1) {
  for (let i = 0; i < lines; i++) console.log("");
}

function ask(question, defaultValue = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const hint = defaultValue ? ` ${c.dim}[${defaultValue}]${c.reset}` : "";
  const prompt = `${c.cyan}${question}${c.reset}${hint}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
}

async function generateCommonFiles(opts) {
  const title = opts.title ?? "Enterprise App";
  const withFsd = opts.withFsd ?? true;
  const projectName =
    opts.projectName ??
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const pm = opts.pm ?? "pnpm";
  writeFile(
    path.join(ROOT, "package.json"),
    PACKAGE_JSON_TEMPLATE(projectName, pm)
  );
  writeFile(path.join(ROOT, "eslint.config.mjs"), ESLINT_CONFIG);
  writeFile(path.join(ROOT, "stylelint.config.mjs"), STYLELINT_CONFIG);
  writeFile(path.join(ROOT, ".prettierrc"), PRETTIERRC);
  writeFile(path.join(ROOT, ".prettierignore"), PRETTIERRCIGNORE);
  writeFile(path.join(ROOT, ".gitignore"), getGitignore(pm));
  writeFile(path.join(ROOT, "tsconfig.json"), TSCONFIG_JSON);
  writeFile(
    path.join(ROOT, "tsconfig.app.json"),
    withFsd ? TSCONFIG_APP_FSD : TSCONFIG_APP_SIMPLE
  );
  writeFile(
    path.join(ROOT, "tsconfig.node.json"),
    withFsd ? TSCONFIG_NODE_FSD : TSCONFIG_NODE_JSON
  );
  writeFile(path.join(ROOT, "README.md"), README_TEMPLATE(title, withFsd, pm));
  writeFile(path.join(ROOT, ".npmrc"), NPMRC);
  writeFile(path.join(ROOT, ".env.example"), ENV_EXAMPLE);
  writeFile(path.join(ROOT, "index.html"), INDEX_HTML_TEMPLATE(title));
  ensureDir(path.join(ROOT, "public"));
  writeFile(
    path.join(ROOT, "public", "Icon-alabuga-color.svg"),
    ICON_ALABUGA_SVG
  );
  writeFile(path.join(ROOT, "public", "rocket.svg"), ROCKET_SVG_FILE);
  writeFile(path.join(ROOT, ".husky", "pre-commit"), getHuskyPreCommit(pm));
  writeFile(path.join(ROOT, ".husky", "pre-push"), getHuskyPrePush(pm));
}

async function generateFsdStructure() {
  ensureDir(path.join(ROOT, "src", "entities"));
  writeFile(
    path.join(ROOT, "src", "entities", ".gitignore"),
    FSD_LAYER_GITIGNORE
  );
  ensureDir(path.join(ROOT, "src", "features"));
  writeFile(
    path.join(ROOT, "src", "features", ".gitignore"),
    FSD_LAYER_GITIGNORE
  );
  ensureDir(path.join(ROOT, "src", "widgets"));
  writeFile(
    path.join(ROOT, "src", "widgets", ".gitignore"),
    FSD_LAYER_GITIGNORE
  );

  writeFile(path.join(ROOT, "src", "app", "App.tsx"), APP_FSD);
  writeFile(path.join(ROOT, "src", "index.tsx"), INDEX_TSX_FSD);
  writeFile(path.join(ROOT, "src", "shared", "config.ts"), CONFIG_TS);
  writeFile(
    path.join(ROOT, "src", "shared", "cookie", "index.ts"),
    COOKIE_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "shared", "sessionStorage", "index.ts"),
    SESSION_STORAGE_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "shared", "keycloak", "index.ts"),
    KEYCLOAK_INDEX_FSD
  );
  writeFile(path.join(ROOT, "src", "app", "routes.tsx"), ROUTES_FSD);
  writeFile(
    path.join(ROOT, "src", "pages", "main", "index.ts"),
    MAIN_PAGE_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "pages", "main", "ui", "index.tsx"),
    MAIN_PAGE_UI
  );
  writeFile(
    path.join(ROOT, "src", "pages", "main", "ui", "index.module.scss"),
    MAIN_PAGE_MODULE_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "shared", "ui", ".gitignore"),
    FSD_LAYER_GITIGNORE
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "variables.scss"),
    VARIABLES_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "index.scss"),
    APP_STYLES_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "normalize.scss"),
    NORMALIZE_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "firefox.scss"),
    FIREFOX_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "global.scss"),
    GLOBAL_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "helpers", "_index.scss"),
    HELPERS_INDEX_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "helpers", "_mixins.scss"),
    MIXINS_SCSS
  );
  writeFile(path.join(ROOT, "src", "global.d.ts"), GLOBAL_D_TS);
  writeFile(path.join(ROOT, "steiger.config.ts"), STEIGER_CONFIG);
}

async function generateSimpleStructure() {
  writeFile(path.join(ROOT, "src", "app", "App.tsx"), APP_SIMPLE);
  writeFile(path.join(ROOT, "src", "index.tsx"), INDEX_TSX_SIMPLE);
  writeFile(path.join(ROOT, "src", "shared", "config.ts"), CONFIG_TS);
  writeFile(
    path.join(ROOT, "src", "shared", "cookie", "index.ts"),
    COOKIE_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "shared", "sessionStorage", "index.ts"),
    SESSION_STORAGE_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "shared", "keycloak", "index.ts"),
    KEYCLOAK_INDEX_SIMPLE
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "variables.scss"),
    VARIABLES_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "index.scss"),
    APP_STYLES_INDEX
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "normalize.scss"),
    NORMALIZE_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "firefox.scss"),
    FIREFOX_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "global.scss"),
    GLOBAL_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "helpers", "_index.scss"),
    HELPERS_INDEX_SCSS
  );
  writeFile(
    path.join(ROOT, "src", "app", "styles", "helpers", "_mixins.scss"),
    MIXINS_SCSS
  );
  writeFile(path.join(ROOT, "src", "global.d.ts"), GLOBAL_D_TS);
  const steigerPath = path.join(ROOT, "steiger.config.ts");
  if (fs.existsSync(steigerPath)) fs.unlinkSync(steigerPath);
}

function updateRsbuildConfig(withFsd) {
  const aliases = withFsd ? RSBUILD_ALIASES_FSD : RSBUILD_ALIASES_SIMPLE;
  const content = RSBUILD_BASE.replace("...ALIASES", aliases).replace(
    "SASS_ADDITIONAL",
    SASS_ADDITIONAL_FN
  ).replace(
    "SASS_INCLUDE_PATHS",
    "[path.resolve(__dirname, \"src/app/styles\")]"
  );
  writeFile(path.join(ROOT, "rsbuild.config.ts"), content);
}

function updatePackageJson(withFsd, pm) {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const cfg = PM_CONFIG[pm];
  if (withFsd) {
    pkg.scripts.fsd = "steiger check";
    pkg.scripts["fsd:fix"] = "steiger check --fix";
  } else {
    delete pkg.scripts.fsd;
    delete pkg.scripts["fsd:fix"];
  }
  pkg.scripts.dev = `${cfg.exec} rsbuild dev`;
  pkg.scripts.build = `${cfg.exec} rsbuild build`;
  pkg.scripts.audit = cfg.audit;
  pkg.scripts["lint:style"] = 'stylelint "**/*.{css,scss}"';
  pkg.scripts["lint:style:fix"] = 'stylelint "**/*.{css,scss}" --fix';
  pkg["lint-staged"] = {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"],
  };
  if (pkg.devDependencies && !pkg.devDependencies["@rsbuild/plugin-sass"]) {
    pkg.devDependencies["@rsbuild/plugin-sass"] = "^1.1.0";
  }
  if (pkg.devDependencies && !pkg.devDependencies.stylelint) {
    pkg.devDependencies.stylelint = "^16.20.0";
    pkg.devDependencies["stylelint-config-standard-scss"] = "^15.0.1";
  }
  if (pkg.devDependencies) {
    delete pkg.devDependencies["eslint-plugin-simple-import-sort"];
    if (!pkg.devDependencies["@trivago/prettier-plugin-sort-imports"]) {
      pkg.devDependencies["@trivago/prettier-plugin-sort-imports"] = "^6.0.2";
    }
    if (!pkg.devDependencies["eslint-plugin-security"]) {
      pkg.devDependencies["eslint-plugin-security"] = "^4.0.0";
    }
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
}

function toProjectName(str) {
  return (
    str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "") || "my-app"
  );
}

async function main() {
  logEmpty();
  log("  ╭─────────────────────────────────────────╮", c.cyan);
  log("  │     🚀 Enterprise Rsbuild Preset        │", c.cyan);
  log("  │         Создание нового проекта         │", c.cyan);
  log("  ╰─────────────────────────────────────────╯", c.cyan);
  logEmpty();

  let presetId = "react-ts";
  let withFsd = true;
  let title = "Enterprise App";
  let projectName = "my-app";
  let pm = "pnpm";

  const PM_OPTIONS = ["pnpm", "yarn", "npm"];
  const parsePm = (val) => {
    const v = (val || "").toLowerCase().trim();
    return PM_OPTIONS.includes(v) ? v : null;
  };

  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--preset=")) presetId = arg.split("=")[1];
    if (arg.startsWith("--fsd="))
      withFsd =
        arg.split("=")[1].toLowerCase() === "y" ||
        arg.split("=")[1].toLowerCase() === "yes";
    if (arg.startsWith("--title="))
      title = arg.split("=").slice(1).join("=").trim();
    if (arg.startsWith("--name="))
      projectName = toProjectName(arg.split("=").slice(1).join("="));
    if (arg.startsWith("--pm=")) {
      const parsed = parsePm(arg.split("=")[1]);
      if (parsed) pm = parsed;
    }
  }

  if (!args.some((a) => a.startsWith("--name="))) {
    log(`  ${c.bold}📁 Имя проекта${c.reset}`, "");
    log("  Папка создастся рядом с preset", c.dim);
    logEmpty();
    const nameAnswer = await ask("  Имя проекта", "my-app");
    projectName = toProjectName(nameAnswer);
    logEmpty();
  }
  if (!args.some((a) => a.startsWith("--pm="))) {
    log(`  ${c.bold}📦 Пакетный менеджер${c.reset}`, "");
    log("  1 = pnpm, 2 = yarn, 3 = npm", c.dim);
    logEmpty();
    const pmAnswer = await ask("  Пакетный менеджер (1/2/3)", "1");
    const pmMap = { "1": "pnpm", "2": "yarn", "3": "npm" };
    pm = pmMap[pmAnswer.trim()] ?? pm;
    logEmpty();
  }
  if (!args.some((a) => a.startsWith("--preset="))) {
    log(`  ${c.bold}📦 Пресет${c.reset}`, "");
    log("  1 = React + TypeScript", c.dim);
    logEmpty();
    const presetAnswer = await ask("  Выбери пресет", "1");
    presetId = presetAnswer === "1" ? "react-ts" : presetId;
    logEmpty();
  }
  if (!args.some((a) => a.startsWith("--fsd="))) {
    log(`  ${c.bold}📐 Архитектура${c.reset}`, "");
    log("  FSD (Feature-Sliced Design) — да/нет", c.dim);
    logEmpty();
    const fsdAnswer = await ask("  FSD структура", "y");
    withFsd = /^y(es)?$/i.test(fsdAnswer);
    logEmpty();
  }

  ROOT = path.resolve(PRESET_DIR, "..", projectName);
  if (fs.existsSync(ROOT) && fs.readdirSync(ROOT).length > 0) {
    logEmpty();
    log("  ❌  Ошибка", c.red);
    log(
      `  Папка "${projectName}" уже существует и не пуста. Выбери другое имя.`,
      c.dim
    );
    logEmpty();
    process.exit(1);
  }

  log(`  ${c.bold}⚙️  Создание проекта...${c.reset}`, "");
  logEmpty();
  ensureDir(ROOT);

  await generateCommonFiles({ title, withFsd, projectName, pm });
  if (withFsd) {
    await generateFsdStructure();
  } else {
    await generateSimpleStructure();
  }
  updateRsbuildConfig(withFsd);
  updatePackageJson(withFsd, pm);

  logEmpty();
  log("  ╭─────────────────────────────────────────╮", c.green);
  log("  │  ✅  Проект успешно создан!             │", c.green);
  log("  ╰─────────────────────────────────────────╯", c.green);
  logEmpty();
  log(`  📂  Папка: ${c.bold}${projectName}${c.reset}`, "");
  logEmpty();
  log("  Дальше:", c.bold);
  logEmpty();
  const pmCfg = PM_CONFIG[pm];
  log(`    ${c.cyan}cd ../${projectName}${c.reset}`, "");
  log(`    ${c.dim}добавь NPM_TOKEN в .npmrc${c.reset}`, "");
  log(`    ${c.cyan}${pmCfg.install}${c.reset}`, "");
  log(`    ${c.cyan}${pmCfg.run} dev${c.reset}`, "");
  logEmpty();
}

main().catch((err) => {
  logEmpty();
  log("  ❌  Ошибка", c.red);
  console.error(err);
  process.exit(1);
});
