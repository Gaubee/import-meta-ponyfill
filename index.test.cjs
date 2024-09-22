//@ts-check
const { resolve } = require("node:path");
const { test } = require("node:test");
const assert = require("node:assert");
const { import_meta_ponyfill } = require("./index.cjs");

const DIRNAME = __dirname;
const UNI_DIRNAME = __dirname.replaceAll("\\", "/");

test("1", () => {
  assert.equal(
    import_meta_ponyfill(require, __filename)
      .resolve("./index.cjs")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/index.cjs"
  );
});

test("2", () => {
  assert.equal(
    import_meta_ponyfill(require, __filename)
      .resolve("@dweb-browser/zstd-wasm")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/node_modules/@dweb-browser/zstd-wasm/zstd_wasm.js"
  );
});

test("3", () => {
  assert.equal(
    import_meta_ponyfill(require, __filename)
      .resolve("@dweb-browser/zstd-wasm/zstd_wasm_bg_wasm")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/node_modules/@dweb-browser/zstd-wasm/zstd_wasm_bg_wasm.js"
  );
});
test("4", () => {
  assert.equal(import_meta_ponyfill(require, __filename).main, true);
});
test("5", () => {
  assert.equal(
    import_meta_ponyfill(require, __filename).url.replace(UNI_DIRNAME, "*"),
    "file:///*/index.test.cjs"
  );
});

test("6", () => {
  assert.equal(import_meta_ponyfill(require, __filename).dirname, DIRNAME);
});

test("7", () => {
  assert.equal(
    import_meta_ponyfill(require, __filename).filename,
    resolve(DIRNAME, "index.test.cjs")
  );
});
