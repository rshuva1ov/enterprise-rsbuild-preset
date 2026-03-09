#!/usr/bin/env node
/**
 * Генератор проектов на базе Rsbuild.
 * Использование: pnpm enterprise | node scripts/commands/create-enterprise.cjs [--name=...] [--pm=...] [--preset=...] [--fsd=1|2] [--no-registry] [--help]
 */

require("../lib/env.cjs");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const { getRegistries } = require("../lib/env.cjs");
const { validateProjectName, exitWithError } = require("../lib/cli.cjs");

let constants;
try {
  constants = require("../templates/index.cjs");
} catch (err) {
  exitWithError(
    `Не удалось загрузить конфигурацию: ${err.message}. Проверь наличие scripts/deps.json и scripts/registries.json.`
  );
}

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
  getNpmrc,
  PACKAGE_JSON_TEMPLATE,
  ENV_EXAMPLE,
  INDEX_HTML_TEMPLATE,
  getHuskyPreCommit,
  getHuskyPrePush,
  ICON_ALABUGA_SVG,
  ROCKET_SVG_FILE,
  FSD_LAYER_GITIGNORE,
} = constants;

const PRESET_DIR = path.resolve(__dirname, "..", "..");
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
  writeFile(path.join(ROOT, ".npmrc"), getNpmrc());
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
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
}

const HELP = `
  Создание проекта на базе Rsbuild

  Использование:
    pnpm enterprise
    node scripts/commands/create-enterprise.cjs [опции]

  Опции:
    --name=<имя>     Имя проекта (папка). Только a-z, 0-9, дефис.
    --pm=<pm>        Пакетный менеджер: pnpm | yarn | npm
    --preset=<id>    Пресет (по умолчанию react-ts)
    --fsd=1|2        Архитектура: 1 (FSD) или 2 (простая)
    --no-registry    Пропустить вопрос о добавлении приватного реестра

  Примеры:
    node scripts/commands/create-enterprise.cjs --name=my-app --pm=pnpm --fsd=1
    node scripts/commands/create-enterprise.cjs --help
`;

async function askWithRetry(question, defaultValue, validator, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const answer = await ask(question, defaultValue);
    const result = validator(answer);
    if (result.valid) return result.value;
    log(`  ${c.yellow}⚠ ${result.error}${c.reset}`, "");
    if (i < maxRetries - 1) log("  Попробуй ещё раз.", c.dim);
  }
  exitWithError("Слишком много неверных попыток.");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    process.exit(0);
  }
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

  for (const arg of args) {
    if (arg.startsWith("--preset=")) presetId = arg.split("=")[1];
    if (arg.startsWith("--fsd=")) {
      const v = (arg.split("=")[1] || "").toLowerCase().trim();
      if (v === "1" || v === "y" || v === "yes") withFsd = true;
      else if (v === "2" || v === "n" || v === "no") withFsd = false;
    }
    if (arg.startsWith("--title="))
      title = arg.split("=").slice(1).join("=").trim();
    if (arg.startsWith("--name=")) {
      const parsed = validateProjectName(arg.split("=").slice(1).join("="));
      if (parsed.valid) projectName = parsed.value;
      else exitWithError(parsed.error);
    }
    if (arg.startsWith("--pm=")) {
      const parsed = parsePm(arg.split("=")[1]);
      if (parsed) pm = parsed;
      else exitWithError("Неверный PM. Используй: pnpm, yarn или npm");
    }
  }

  const pmValidator = (val) => {
    const v = (val || "").trim().toLowerCase();
    const pmMap = { "1": "pnpm", "2": "yarn", "3": "npm" };
    const resolved = pmMap[v] ?? (["pnpm", "yarn", "npm"].includes(v) ? v : null);
    return resolved ? { valid: true, value: resolved } : { valid: false, error: "Введи 1 (pnpm), 2 (yarn) или 3 (npm)" };
  };
  const fsdValidator = (val) => {
    const v = (val || "").trim();
    if (v === "1") return { valid: true, value: true };
    if (v === "2") return { valid: true, value: false };
    return { valid: false, error: "Введи 1 (FSD) или 2 (простая структура)" };
  };

  if (!args.some((a) => a.startsWith("--name="))) {
    log(`  ${c.bold}📁 Имя проекта${c.reset}`, "");
    log("  Папка создастся рядом с preset. Только a-z, 0-9, дефис.", c.dim);
    logEmpty();
    projectName = await askWithRetry(
      "  Имя проекта",
      "my-app",
      (a) => validateProjectName(a || "my-app")
    );
    logEmpty();
  }
  if (!args.some((a) => a.startsWith("--pm="))) {
    log(`  ${c.bold}📦 Пакетный менеджер${c.reset}`, "");
    log("  1 = pnpm, 2 = yarn, 3 = npm", c.dim);
    logEmpty();
    pm = await askWithRetry("  Пакетный менеджер (1/2/3)", "1", pmValidator);
    logEmpty();
  }
  if (!args.some((a) => a.startsWith("--preset="))) {
    log(`  ${c.bold}📦 Пресет${c.reset}`, "");
    log("  1 = React + TypeScript", c.dim);
    logEmpty();
    const presetAnswer = await ask("  Выбери пресет", "1");
    presetId = presetAnswer === "1" || !presetAnswer ? "react-ts" : presetId;
    logEmpty();
  }
  if (!args.some((a) => a.startsWith("--fsd="))) {
    log(`  ${c.bold}📐 Архитектура${c.reset}`, "");
    log("  1 = FSD (Feature-Sliced Design), 2 = простая структура", c.dim);
    logEmpty();
    withFsd = await askWithRetry("  Архитектура (1/2)", "1", fsdValidator);
    logEmpty();
  }

  if (!args.some((a) => a === "--no-registry")) {
    log(`  ${c.bold}📦 Приватный реестр${c.reset}`, "");
    log("  1 = добавить scope, URL и NPM_TOKEN, 2 = пропустить", c.dim);
    logEmpty();
    const registryValidator = (val) => {
      const v = (val || "").trim();
      if (v === "1") return { valid: true, value: true };
      if (v === "2") return { valid: true, value: false };
      return { valid: false, error: "Введи 1 или 2" };
    };
    const addRegistry = await askWithRetry("  Приватный реестр (1/2)", "2", registryValidator);
    if (addRegistry) {
      const { addInteractive } = require("./add-registry.cjs");
      await addInteractive();
      logEmpty();
    }
  }

  ROOT = path.resolve(PRESET_DIR, "..", projectName);
  if (fs.existsSync(ROOT)) {
    const isEmpty = fs.readdirSync(ROOT).length === 0;
    if (!isEmpty) {
      logEmpty();
      log("  ❌  Ошибка", c.red);
      log(
        `  Папка "${projectName}" уже существует и не пуста. Выбери другое имя.`,
        c.dim
      );
      logEmpty();
      process.exit(1);
    }
    const overwrite = await ask(
      `  Папка "${projectName}" пуста. Перезаписать? (y/n)`,
      "y"
    );
    if (!/^y(es)?$/i.test(overwrite.trim())) {
      log("Отменено.", c.dim);
      process.exit(0);
    }
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
  const registries = getRegistries();
  const depsPath = path.resolve(__dirname, "..", "deps.json");
  let hasPrivateDeps = false;
  if (fs.existsSync(depsPath)) {
    try {
      const deps = JSON.parse(fs.readFileSync(depsPath, "utf-8"));
      hasPrivateDeps = Object.keys(deps.privateDependencies || {}).length > 0;
    } catch {
      /* ignore */
    }
  }
  if (hasPrivateDeps) {
    if (Object.keys(registries).length === 0) {
      log(`    ${c.yellow}⚠ Приватные пакеты: настрой реестр в preset${c.reset}`, "");
      log(`    ${c.dim}${PM_CONFIG[pm].run} add-enterprise${c.reset}`, "");
      log(`    ${c.dim}Затем пересоздай проект${c.reset}`, "");
    } else {
      log(`    ${c.dim}задай NPM_TOKEN в окружении или в .npmrc для приватных пакетов${c.reset}`, "");
    }
  }
  log(`    ${c.cyan}${pmCfg.install}${c.reset}`, "");
  log(`    ${c.cyan}${pmCfg.run} dev${c.reset}`, "");
  logEmpty();
}

main().catch((err) => {
  logEmpty();
  exitWithError(err.message || String(err));
});
