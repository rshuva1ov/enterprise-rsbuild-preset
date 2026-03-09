/**
 * Единая точка входа для всех шаблонов.
 * Re-exports из модулей templates/.
 */
const { PM_CONFIG, PRESETS } = require("../config/pm.cjs");

const rsbuild = require("./rsbuild.cjs");
const app = require("./app.cjs");
const shared = require("./shared.cjs");
const styles = require("./styles.cjs");
const lint = require("./lint.cjs");
const tsconfig = require("./tsconfig.cjs");
const pkg = require("./package.cjs");
const assets = require("./assets.cjs");

module.exports = {
  PRESETS,
  PM_CONFIG,
  ...rsbuild,
  ...app,
  ...shared,
  ...styles,
  ...lint,
  ...tsconfig,
  ...pkg,
  ...assets,
};
