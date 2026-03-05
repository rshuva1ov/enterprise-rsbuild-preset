#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PRESET_DIR = path.resolve(__dirname, "..");

function ask(question, defaultValue = "") {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() || defaultValue);
    });
  });
}

async function main() {
  const arg = process.argv[2];
  if (arg !== "enterprise") {
    console.log("\nУдаление preset. Использование: pnpm kill enterprise | npm run kill enterprise | yarn kill enterprise\n");
    process.exit(1);
  }

  const confirm = await ask("Удалить enterprise-rsbuild-preset? (y/n)", "n");
  if (confirm !== "y" && confirm !== "yes") {
    console.log("Отменено.\n");
    process.exit(0);
  }

  const parent = path.dirname(PRESET_DIR);
  process.chdir(parent);
  fs.rmSync(PRESET_DIR, { recursive: true, force: true });
  console.log("\n✅ Preset удалён.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
