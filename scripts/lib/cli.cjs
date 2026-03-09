/**
 * Утилиты CLI: валидация, вывод, выход с ошибкой.
 */

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
};

function log(msg, color = "") {
  console.log(color ? `${color}${msg}${c.reset}` : msg);
}

function exitWithError(msg, code = 1) {
  console.error(`${c.red}Ошибка:${c.reset} ${msg}`);
  process.exit(code);
}

function validateProjectName(name) {
  const cleaned = (name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
  if (!cleaned) return { valid: false, error: "Имя не может быть пустым" };
  if (cleaned.length > 50) return { valid: false, error: "Имя слишком длинное" };
  if (/^[0-9]/.test(cleaned)) return { valid: false, error: "Имя не должно начинаться с цифры" };
  return { valid: true, value: cleaned || "my-app" };
}

function validateScope(scope) {
  if (!scope || typeof scope !== "string") return { valid: false, error: "Scope не указан" };
  const s = scope.trim();
  if (!s.startsWith("@")) return { valid: false, error: "Scope должен начинаться с @ (например @myorg)" };
  if (s.length < 2) return { valid: false, error: "Scope слишком короткий" };
  if (s.includes("/")) return { valid: false, error: "Scope не должен содержать / (только @org)" };
  return { valid: true, value: s };
}

function validateUrl(url) {
  if (!url || typeof url !== "string") return { valid: false, error: "URL не указан" };
  try {
    const u = new URL(url.trim());
    if (!["http:", "https:"].includes(u.protocol)) {
      return { valid: false, error: "URL должен использовать http или https" };
    }
    return { valid: true, value: u.href.replace(/\/$/, "") + "/" };
  } catch {
    return { valid: false, error: "Некорректный URL" };
  }
}

module.exports = {
  c,
  log,
  exitWithError,
  validateProjectName,
  validateScope,
  validateUrl,
};
