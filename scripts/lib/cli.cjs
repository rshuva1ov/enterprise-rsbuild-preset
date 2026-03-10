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

/** Безопасный scope: только @org с буквами, цифрами, дефисом, подчёркиванием */
const SCOPE_SAFE_REGEX = /^@[a-zA-Z0-9_-]+$/;

function validateScope(scope) {
  if (!scope || typeof scope !== "string") return { valid: false, error: "Scope не указан" };
  const s = scope.trim();
  if (!s.startsWith("@")) return { valid: false, error: "Scope должен начинаться с @ (например @myorg)" };
  if (s.length < 2) return { valid: false, error: "Scope слишком короткий" };
  if (s.length > 50) return { valid: false, error: "Scope слишком длинный" };
  if (s.includes("/")) return { valid: false, error: "Scope не должен содержать / (только @org)" };
  if (!SCOPE_SAFE_REGEX.test(s)) {
    return { valid: false, error: "Scope может содержать только буквы, цифры, дефис и подчёркивание" };
  }
  return { valid: true, value: s };
}

function validateUrl(url) {
  if (!url || typeof url !== "string") return { valid: false, error: "URL не указан" };
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:") {
      return { valid: false, error: "URL должен использовать HTTPS (HTTP небезопасен для передачи токенов)" };
    }
    return { valid: true, value: u.href.replace(/\/$/, "") + "/" };
  } catch {
    return { valid: false, error: "Некорректный URL" };
  }
}

/** npm package name: scope/name или name, буквы/цифры/дефис/подчёркивание/точка */
const PACKAGE_NAME_REGEX = /^(?:@[a-zA-Z0-9_-]+\/)?[a-zA-Z0-9._-]+$/;

function validatePackageName(name) {
  if (!name || typeof name !== "string") return { valid: false, error: "Имя пакета не указано" };
  const s = name.trim();
  if (!s) return { valid: false, error: "Имя пакета не может быть пустым" };
  if (s.length > 214) return { valid: false, error: "Имя пакета слишком длинное" };
  if (!PACKAGE_NAME_REGEX.test(s)) {
    return { valid: false, error: "Имя пакета может содержать только буквы, цифры, дефис, подчёркивание и точку" };
  }
  return { valid: true, value: s };
}

/** Semver-подобная версия (цифры, точки, x, *, ^, ~, дефис, буквы для pre-release) */
const VERSION_REGEX = /^[\d.xX*^~a-zA-Z_-]+$/;

function validateVersion(version) {
  if (!version || typeof version !== "string") return { valid: false, error: "Версия не указана" };
  const s = version.trim();
  if (!s) return { valid: false, error: "Версия не может быть пустой" };
  if (s.length > 50) return { valid: false, error: "Версия слишком длинная" };
  if (!VERSION_REGEX.test(s)) {
    return { valid: false, error: "Версия содержит недопустимые символы" };
  }
  return { valid: true, value: s };
}

module.exports = {
  c,
  log,
  exitWithError,
  validateProjectName,
  validateScope,
  validateUrl,
  validatePackageName,
  validateVersion,
  SCOPE_SAFE_REGEX,
};
