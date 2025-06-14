//@ts-check
import { test } from "node:test";
import assert from "node:assert";
import process from "node:process";
import { resolve } from "node:path";
import import_meta_ponyfill from "import-meta-ponyfill";

const DIRNAME = process.cwd();
let UNI_DIRNAME = process.cwd().replaceAll("\\", "/");
if (UNI_DIRNAME.startsWith("/")) {
  UNI_DIRNAME = UNI_DIRNAME.slice(1);
}

test("1", () => {
  assert.equal(
    import_meta_ponyfill(import.meta)
      .resolve("./index.mjs")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/index.mjs"
  );
});

test("2", () => {
  assert.ok(
    import_meta_ponyfill(import.meta)
      .resolve("@dweb-browser/zstd-wasm")
      .endsWith("node_modules/@dweb-browser/zstd-wasm/zstd_wasm.mjs")
  );
});

test("3", () => {
  assert.ok(
    import_meta_ponyfill(import.meta)
      .resolve("@dweb-browser/zstd-wasm/zstd_wasm_bg_wasm")
      .endsWith("node_modules/@dweb-browser/zstd-wasm/zstd_wasm_bg_wasm.mjs")
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

test("8", () => {
  assert.equal(
    import_meta_ponyfill(import.meta)
      .resolve("./no-file")
      .replace(UNI_DIRNAME, "*"),
    "file:///*/no-file"
  );
});
