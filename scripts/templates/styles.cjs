/**
 * Шаблоны SCSS и global.d.ts.
 */
const VARIABLES_SCSS = `$primary-color: #1976d2;
$font-family-base: system-ui, sans-serif;
`;

const APP_STYLES_INDEX = `@use "normalize";
@use "firefox";
@use "global";
`;

const NORMALIZE_SCSS = `/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */

html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
}

main {
  display: block;
}

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

hr {
  box-sizing: content-box;
  height: 0;
  overflow: visible;
}

pre {
  font-family: monospace, monospace;
  font-size: 1em;
}

a {
  background-color: transparent;
}

abbr[title] {
  border-bottom: none;
  text-decoration: underline dotted;
}

b, strong {
  font-weight: bolder;
}

code, kbd, samp {
  font-family: monospace, monospace;
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub, sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

img {
  border-style: none;
}

button, input, optgroup, select, textarea {
  font-family: inherit;
  font-size: 100%;
  line-height: 1.15;
  margin: 0;
}

button, input {
  overflow: visible;
}

button, select {
  text-transform: none;
}

button, [type="button"], [type="reset"], [type="submit"] {
  -webkit-appearance: button;
}

button::-moz-focus-inner, [type="button"]::-moz-focus-inner, [type="reset"]::-moz-focus-inner, [type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

button:-moz-focusring, [type="button"]:-moz-focusring, [type="reset"]:-moz-focusring, [type="submit"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}

fieldset {
  padding: 0.35em 0.75em 0.625em;
}

legend {
  box-sizing: border-box;
  color: inherit;
  display: table;
  max-width: 100%;
  padding: 0;
  white-space: normal;
}

progress {
  vertical-align: baseline;
}

textarea {
  overflow: auto;
}

[type="checkbox"], [type="radio"] {
  box-sizing: border-box;
}

[type="number"]::-webkit-inner-spin-button, [type="number"]::-webkit-outer-spin-button {
  height: auto;
}

[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}

[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}

details {
  display: block;
}

summary {
  display: list-item;
}

template {
  display: none;
}

[hidden] {
  display: none;
}
`;

const FIREFOX_SCSS = `input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
`;

const GLOBAL_SCSS = `@import url("https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,100..1000&display=swap");

#root {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  &::-webkit-scrollbar {
    background-color: inherit;
    width: 16px;
  }
  &::-webkit-scrollbar-track {
    background-color: inherit;
  }
  &::-webkit-scrollbar-track:hover {
    background-color: inherit;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--user-surfaces-s-primary-color-content-surface-primary-0);
    border-radius: 16px;
    border: 5px solid var(--user-surfaces-s-main-color-content-surface-main-0);
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--user-surfaces-s-primary-color-content-surface-primary-0);
    border: 4px solid var(--user-surfaces-s-main-color-content-surface-main-0);
  }
}

html {
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Roboto Flex", sans-serif;
}

body {
  background: var(--colors-surfaces-main-0, #f5f7fa);
  font-family: "Roboto Flex", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--colors-typo-main-0, #121212);
}

ul {
  list-style-type: none;
}

img {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

a {
  text-decoration: none;
  color: inherit;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

h1, h2, h3, h4, h5, h6 {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
}

h3 {
  font-size: var(--font-heading-h3-fontSize, 24px);
  font-weight: var(--font-heading-h3-fontWeight-medium, 500);
  line-height: var(--font-heading-h3-lineHeight, 30px);
  letter-spacing: var(--font-heading-h3-letterSpacing, 0.1px);
}

h4 {
  font-size: var(--font-heading-h4-fontSize, 22px);
  font-weight: var(--font-heading-h4-fontWeight-bold, 600);
  line-height: var(--font-heading-h4-lineHeight, 28px);
  letter-spacing: var(--font-heading-h4-letterSpacing, 0.1px);
}

h5 {
  font-size: var(--font-heading-h5-fontSize, 20px);
  font-weight: var(--font-heading-h5-fontWeight-bold, 600);
  line-height: var(--font-heading-h5-lineHeight, 26px);
  letter-spacing: var(--font-heading-h5-letterSpacing, 0.1px);
}

input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

button[aria-selected] {
  cursor: pointer;
}
`;

const HELPERS_INDEX_SCSS = `@forward "mixins";
`;

const MIXINS_SCSS = `@mixin flex($align-items: flex-start, $justify-items: flex-start, $gap: 0, $direction: row, $wrap: nowrap) {
  display: flex;
  align-items: $align-items;
  justify-content: $justify-items;
  flex-direction: $direction;
  gap: $gap;
  flex-wrap: $wrap;
}

@mixin font($size, $weight: 400, $line-height: initial, $color: inherit, $letter-spacing: initial) {
  font-size: $size;
  font-weight: $weight;
  line-height: $line-height;
  color: $color;
  letter-spacing: $letter-spacing;
}

@mixin size($size) {
  width: $size;
  height: $size;
}

@mixin min-size($size) {
  min-width: $size;
  min-height: $size;
}

@mixin position($position: null, $top: null, $right: null, $bottom: null, $left: null, $z-index: null) {
  $properties: (position: $position, top: $top, right: $right, bottom: $bottom, left: $left, z-index: $z-index);
  @each $property, $value in $properties {
    @if $value != null {
      #{$property}: $value;
    }
  }
}

@mixin m-x($size) {
  margin-left: $size;
  margin-right: $size;
}

@mixin p-x($size) {
  padding-left: $size;
  padding-right: $size;
}

@mixin m-y($size) {
  margin-bottom: $size;
  margin-top: $size;
}

@mixin border-y($color) {
  border-bottom: $color;
  border-top: $color;
}

@mixin border-top-radius($size) {
  border-top-left-radius: $size;
  border-top-right-radius: $size;
}

@mixin border-bottom-radius($size) {
  border-bottom-left-radius: $size;
  border-bottom-right-radius: $size;
}

@mixin p-y($size) {
  padding-bottom: $size;
  padding-top: $size;
}

@mixin max-min-width($width) {
  max-width: $width;
  min-width: $width;
}

@mixin max-min-height($height) {
  max-height: $height;
  min-height: $height;
}

@mixin line-clamp($line) {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: $line;
}

@mixin visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  border: 0 !important;
  padding: 0 !important;
  white-space: nowrap !important;
  clip-path: inset(100%) !important;
  clip: rect(0 0 0 0) !important;
  overflow: hidden !important;
}

@mixin hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

$sm: 360px;
$md: 640px;
$lt: 1024px;
$lx: 1240px;
$xxl: 1440px;
$lg: 1920px;

@mixin respond-from($media) {
  @if $media == small {
    @media only screen and (max-width: $sm) {
      @content;
    }
  } @else if $media == medium {
    @media only screen and (max-width: $md) {
      @content;
    }
  } @else if $media == large {
    @media only screen and (max-width: $lt) {
      @content;
    }
  } @else if $media == extraLarge {
    @media only screen and (max-width: $lx) {
      @content;
    }
  } @else if $media == extraExtraLarge {
    @media only screen and (max-width: $xxl) {
      @content;
    }
  } @else if $media == largeDesktop {
    @media only screen and (max-width: $lg) {
      @content;
    }
  }
}
`;

const GLOBAL_D_TS = `declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const content: string;
  export default content;
}
`;

module.exports = {
  VARIABLES_SCSS,
  APP_STYLES_INDEX,
  NORMALIZE_SCSS,
  FIREFOX_SCSS,
  GLOBAL_SCSS,
  HELPERS_INDEX_SCSS,
  MIXINS_SCSS,
  GLOBAL_D_TS,
};
