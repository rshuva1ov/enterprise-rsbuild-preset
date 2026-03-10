#!/usr/bin/env node
/**
 * Проверка работоспособности при различных сценариях.
 * Запуск: node tests/test-scenarios.cjs
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SCRIPTS = path.join(ROOT, "scripts");
const ENV_PATH = path.join(ROOT, ".env");
const REGISTRIES_PATH = path.join(SCRIPTS, "registries.json");
const DEPS_PATH = path.join(SCRIPTS, "deps.json");

const backups = {};
let passed = 0;
let failed = 0;

function backup(name, filePath) {
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    backups[name] = stat.isFile() ? fs.readFileSync(filePath, "utf-8") : null;
  } else {
    backups[name] = null;
  }
}

function restore(name, filePath) {
  if (backups[name] === undefined) return;
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) fs.rmSync(filePath, { recursive: true, force: true });
      else fs.unlinkSync(filePath);
    }
  } catch {}
  if (backups[name] !== null) {
    fs.writeFileSync(filePath, backups[name], "utf-8");
  }
}

function run(cmd, args = [], opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf-8",
    timeout: 60000,
    ...opts,
  });
  return {
    status: r.status,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
    error: r.error,
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

console.log("\n=== Тестирование сценариев ===\n");

// Backup
backup("env", ENV_PATH);
backup("registries", REGISTRIES_PATH);
backup("deps", DEPS_PATH);

try {
  // --- 1. Нет .env ---
  console.log("1. Сценарий: нет .env");
  if (fs.existsSync(ENV_PATH)) {
    const stat = fs.statSync(ENV_PATH);
    if (stat.isDirectory()) fs.rmSync(ENV_PATH, { recursive: true, force: true });
    else fs.unlinkSync(ENV_PATH);
  }
  delete process.env.NPM_TOKEN;

  test("add-registry list без .env", () => {
    const r = run("node", ["scripts/commands/add-registry.cjs", "list"]);
    if (r.status !== 0 && r.stderr.includes("Ошибка")) throw new Error(r.stderr);
  });

  test("update-deps без .env (только публичные пакеты)", () => {
    const depsBackup = fs.readFileSync(DEPS_PATH, "utf-8");
    fs.writeFileSync(
      DEPS_PATH,
      JSON.stringify(
        {
          dependencies: { react: "^18.0.0" },
          devDependencies: {},
          privateDependencies: {},
        },
        null,
        2
      ),
      "utf-8"
    );
    try {
      const r = run("node", ["scripts/commands/update-deps.cjs"]);
      if (r.status !== 0) throw new Error(`exit ${r.status}: ${r.stderr}`);
    } finally {
      fs.writeFileSync(DEPS_PATH, depsBackup, "utf-8");
    }
  });

  // --- 2. Есть .env ---
  console.log("\n2. Сценарий: есть .env");
  if (fs.existsSync(ENV_PATH) && fs.statSync(ENV_PATH).isDirectory()) {
    fs.rmSync(ENV_PATH, { recursive: true, force: true });
  }
  fs.writeFileSync(ENV_PATH, "NPM_TOKEN=test-token-123\n", "utf-8");

  test("env.cjs загружает NPM_TOKEN", () => {
    const r = run("node", [
      "-e",
      "require('./scripts/lib/env.cjs'); if (!process.env.NPM_TOKEN) throw new Error('NPM_TOKEN не загружен');",
    ]);
    if (r.status !== 0) throw new Error(r.stderr || "NPM_TOKEN не загружен");
  });

  test("add-registry list с .env", () => {
    const r = run("node", ["scripts/commands/add-registry.cjs", "list"]);
    if (r.status !== 0) throw new Error(r.stderr);
  });

  // --- 3. .env некорректный ---
  console.log("\n3. Сценарий: некорректный .env");
  fs.writeFileSync(ENV_PATH, "NPM_TOKEN=ok\nNODE_OPTIONS=--require=/evil\n", "utf-8");

  test("NODE_OPTIONS не загружается (allowlist)", () => {
    const r = run("node", [
      "-e",
      "require('./scripts/lib/env.cjs'); if (process.env.NODE_OPTIONS) throw new Error('NODE_OPTIONS не должен загружаться');",
    ]);
    if (r.status !== 0) throw new Error(r.stderr);
  });

  fs.writeFileSync(ENV_PATH, "NPM_TOKEN=valid\n", "utf-8");

  // --- 4. Некорректные имена приватных пакетов в deps.json ---
  console.log("\n4. Сценарий: некорректные privateDependencies в deps.json");
  const depsOriginal = fs.readFileSync(DEPS_PATH, "utf-8");
  fs.writeFileSync(
    DEPS_PATH,
    JSON.stringify(
      {
        dependencies: { react: "^18.0.0" },
        devDependencies: {},
        privateDependencies: {
          "@valid/pkg": "^1.0.0",
          "invalid@name": "^1.0.0",
          "@scope/bad name": "^1.0.0",
        },
      },
      null,
      2
    ),
    "utf-8"
  );

  test("loadDeps не падает на некорректных именах", () => {
    const { loadDeps } = require("../scripts/config/deps.cjs");
    const deps = loadDeps();
    if (!deps.dependencies) throw new Error("dependencies отсутствуют");
  });

  fs.writeFileSync(DEPS_PATH, depsOriginal, "utf-8");

  // --- 5. Нет registries.json ---
  console.log("\n5. Сценарий: нет registries.json");
  const regBackup = fs.readFileSync(REGISTRIES_PATH, "utf-8");
  fs.renameSync(REGISTRIES_PATH, REGISTRIES_PATH + ".bak");

  test("add-registry list без registries.json", () => {
    const r = run("node", ["scripts/commands/add-registry.cjs", "list"]);
    if (r.status !== 0) throw new Error(r.stderr);
    if (!r.stdout.includes("Нет реестров")) throw new Error("Ожидалось сообщение о пустом списке");
  });

  test("getRegistries возвращает {}", () => {
    const { getRegistries } = require("../scripts/lib/env.cjs");
    const r = getRegistries();
    if (Object.keys(r).length !== 0) throw new Error("Ожидался пустой объект");
  });

  fs.renameSync(REGISTRIES_PATH + ".bak", REGISTRIES_PATH);

  // --- 6. Битый registries.json ---
  console.log("\n6. Сценарий: битый registries.json");
  fs.writeFileSync(REGISTRIES_PATH, "{ invalid json", "utf-8");

  test("add-registry list с битым JSON — graceful (пустой список)", () => {
    const r = run("node", ["scripts/commands/add-registry.cjs", "list"]);
    if (r.status !== 0) throw new Error(r.stderr);
    if (!r.stdout.includes("Нет реестров") && !r.stdout.includes("реестры")) {
      throw new Error("Ожидался пустой список при битом JSON");
    }
  });

  fs.writeFileSync(REGISTRIES_PATH, regBackup, "utf-8");

  // --- 7. Нет deps.json ---
  console.log("\n7. Сценарий: нет deps.json");
  if (fs.existsSync(DEPS_PATH)) {
    fs.renameSync(DEPS_PATH, DEPS_PATH + ".bak");
  }

  test("update-deps без deps.json — ошибка", () => {
    const r = run("node", ["scripts/commands/update-deps.cjs"]);
    if (r.status === 0) throw new Error("Ожидалась ошибка");
    if (!r.stderr.includes("deps.json")) throw new Error("Ожидалось сообщение о deps.json");
  });

  test("create-enterprise без deps.json — проверка", () => {
    const r = run("node", ["scripts/commands/create-enterprise.cjs", "--help"]);
    if (r.status !== 0) throw new Error(r.stderr);
  });

  if (fs.existsSync(DEPS_PATH + ".bak")) {
    fs.renameSync(DEPS_PATH + ".bak", DEPS_PATH);
  }

  // --- 8. .env — директория ---
  console.log("\n8. Сценарий: .env — директория");
  fs.unlinkSync(ENV_PATH);
  fs.mkdirSync(ENV_PATH, { recursive: true });

  test("loadEnv не падает когда .env — директория", () => {
    const r = run("node", [
      "-e",
      "require('./scripts/lib/env.cjs'); console.log('ok');",
    ]);
    if (r.status !== 0) throw new Error(r.stderr);
  });

  fs.rmSync(ENV_PATH, { recursive: true });
  fs.writeFileSync(ENV_PATH, "NPM_TOKEN=test\n", "utf-8");

  // --- 9. Валидация версии ---
  console.log("\n9. Сценарий: валидация версии");
  const { validateVersion } = require("../scripts/lib/cli.cjs");
  test("^1.0.0 проходит", () => {
    const r = validateVersion("^1.0.0");
    if (!r.valid) throw new Error(r.error);
  });
  test("^1.0.0-alpha.1 проходит", () => {
    const r = validateVersion("^1.0.0-alpha.1");
    if (!r.valid) throw new Error(r.error || "должна проходить");
  });

  // --- 10. create-enterprise ---
  console.log("\n10. Сценарий: create-enterprise");
  test("create-enterprise --help", () => {
    const r = run("node", ["scripts/commands/create-enterprise.cjs", "--help"]);
    if (r.status !== 0) throw new Error(r.stderr);
  });

  // --- 11. create-enterprise без deps.json (реальное создание) ---
  console.log("\n11. Сценарий: create-enterprise без deps.json");
  if (!fs.existsSync(DEPS_PATH)) throw new Error("deps.json должен существовать перед тестом 11");
  fs.renameSync(DEPS_PATH, DEPS_PATH + ".bak2");
  test("create-enterprise падает с ясной ошибкой без deps.json", () => {
    const r = run("node", [
      "scripts/commands/create-enterprise.cjs",
      "--name=test-fail",
      "--pm=pnpm",
      "--preset=1",
      "--fsd=1",
      "--no-registry",
    ]);
    if (r.status === 0) throw new Error("Ожидалась ошибка");
    const out = r.stderr + r.stdout;
    if (!out.includes("deps.json")) throw new Error("Ожидалось упоминание deps.json: " + out.slice(0, 200));
  });
  if (fs.existsSync(DEPS_PATH + ".bak2")) {
    try {
      fs.renameSync(DEPS_PATH + ".bak2", DEPS_PATH);
    } catch {
      fs.writeFileSync(DEPS_PATH, backups.deps || "{}", "utf-8");
    }
  }

  // --- 12. Битый deps.json ---
  console.log("\n12. Сценарий: битый deps.json");
  const depsContent = fs.readFileSync(DEPS_PATH, "utf-8");
  fs.writeFileSync(DEPS_PATH, "{ broken json", "utf-8");
  test("loadDeps падает с ясной ошибкой при битом JSON", () => {
    try {
      const { loadDeps } = require("../scripts/config/deps.cjs");
      loadDeps();
      throw new Error("Ожидалось исключение");
    } catch (err) {
      if (!err.message.includes("deps.json") && !err.message.includes("JSON")) {
        throw err;
      }
    }
  });
  fs.writeFileSync(DEPS_PATH, depsContent, "utf-8");
} finally {
  restore("env", ENV_PATH);
  restore("registries", REGISTRIES_PATH);
  restore("deps", DEPS_PATH);
  const testFailDir = path.join(ROOT, "..", "test-fail");
  if (fs.existsSync(testFailDir)) {
    try {
      fs.rmSync(testFailDir, { recursive: true, force: true });
    } catch {}
  }
}

console.log(`\n=== Итого: ${passed} пройдено, ${failed} провалено ===\n`);
process.exit(failed > 0 ? 1 : 0);
