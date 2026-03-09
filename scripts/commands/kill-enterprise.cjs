#!/usr/bin/env node
/**
 * Удаление preset. Использование: pnpm kill-enterprise
 */

const fs = require("fs");

const HELP = `
  Удаление preset enterprise-rsbuild-preset

  Использование:
    pnpm kill-enterprise

  Скрипт запросит подтверждение и удалит папку preset.
`;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

const path = require("path");
const readline = require("readline");

const { exitWithError } = require("../lib/cli.cjs");

const PRESET_DIR = path.resolve(__dirname, "..", "..");

function ask(question, defaultValue = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() || defaultValue);
    });
  });
}

async function main() {

  if (!fs.existsSync(PRESET_DIR)) {
    exitWithError("Папка preset не найдена (возможно, уже удалена).");
  }

  const confirm = await ask("Удалить enterprise-rsbuild-preset? (y/n)", "n");
  if (confirm !== "y" && confirm !== "yes") {
    console.log("Отменено.\n");
    process.exit(0);
  }

  try {
    const parent = path.dirname(PRESET_DIR);
    process.chdir(parent);
    fs.rmSync(PRESET_DIR, { recursive: true, force: true });
    console.log("\n✅ Preset удалён.\n");
  } catch (err) {
    exitWithError(`Не удалось удалить: ${err.message}. Проверь права доступа.`);
  }
}

main().catch((err) => {
  exitWithError(err.message || String(err));
});
