//@ts-check
import { test } from "node:test";
import assert from "node:assert";
import process from "node:process";
import { resolve } from "node:path";
import { import_meta_ponyfill } from "./index.mjs";

const DIRNAME = process.cwd();
const UNI_DIRNAME = process.cwd().replaceAll("\\", "/");
console.log("DIRNAME", UNI_DIRNAME);

test("1", () => {
  assert.equal(
    import_meta_ponyfill(import.meta)
      .resolve("./index.mjs")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/index.mjs"
  );
});

test("2", () => {
  assert.equal(
    import_meta_ponyfill(import.meta)
      .resolve("@dweb-browser/zstd-wasm")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/node_modules/@dweb-browser/zstd-wasm/zstd_wasm.mjs"
  );
});

test("3", () => {
  assert.equal(
    import_meta_ponyfill(import.meta)
      .resolve("@dweb-browser/zstd-wasm/zstd_wasm_bg_wasm")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/node_modules/@dweb-browser/zstd-wasm/zstd_wasm_bg_wasm.mjs"
  );
});
test("4", () => {
  assert.equal(import_meta_ponyfill(import.meta).main, true);
});
test("5", () => {
  assert.equal(
    import_meta_ponyfill(import.meta).url.replace(UNI_DIRNAME, "*"),
    "file:///*/index.test.mjs"
  );
});

test("6", () => {
  assert.equal(import_meta_ponyfill(import.meta).dirname, DIRNAME);
});

test("7", () => {
  assert.equal(
    import_meta_ponyfill(import.meta).filename,
    resolve(DIRNAME, "index.test.mjs")
  );
});
