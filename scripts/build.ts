import { $ } from "./$.ts";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const resolve = (path: string) => fileURLToPath(import.meta.resolve(path));

/// commonjs
if (fs.existsSync(resolve("../src"))) {
  fs.rmSync(resolve("../src"), { recursive: true });
}
fs.mkdirSync(resolve("../src"));
fs.writeFileSync(
  resolve("../src/index.cts"),
  fs.readFileSync(resolve("../template/index.ts")) +
    `
export { import_meta_ponyfill_commonjs as import_meta_ponyfill };
export default import_meta_ponyfill_commonjs;
`
);
fs.writeFileSync(
  resolve("../src/tsconfig.json"),
  fs.readFileSync(resolve("../template/tsconfig.commonjs.json"))
);
$.cd(resolve("../src"));
await $("tsc", "--build");
fs.writeFileSync(
  resolve("../index.cjs"),
  fs.readFileSync(resolve("../src/build/index.cjs")) +
    `
module.exports = Object.assign(exports.import_meta_ponyfill_commonjs, exports);
`
);

fs.writeFileSync(
  resolve("../index.d.cts"),
  fs.readFileSync(resolve("../src/build/index.d.cts")) +
    `
interface ImportMetaPonyfill extends ImportMetaPonyfillCommonjs {
  import_meta_ponyfill: ImportMetaPonyfillCommonjs;
  import_meta_ponyfill_commonjs: ImportMetaPonyfillCommonjs;
  import_meta_ponyfill_esmodule: ImportMetaPonyfillEsmodule;
  default: ImportMetaPonyfillCommonjs;
}
declare const import_meta_ponyfill: ImportMetaPonyfill;
export = import_meta_ponyfill;
`
);

/// esmodule
fs.rmSync(resolve("../src"), { recursive: true });
fs.mkdirSync(resolve("../src"));
fs.writeFileSync(
  resolve("../src/index.mts"),
  fs.readFileSync(resolve("../template/index.ts")) +
    `
export { import_meta_ponyfill_esmodule as import_meta_ponyfill };
export default import_meta_ponyfill_esmodule;
`
);
fs.writeFileSync(
  resolve("../src/tsconfig.json"),
  fs.readFileSync(resolve("../template/tsconfig.esmodule.json"))
);
$.cd(resolve("../src"));
await $("tsc", "--build");
fs.writeFileSync(
  resolve("../index.mjs"),
  fs.readFileSync(resolve("../src/build/index.mjs"))
);

fs.writeFileSync(
  resolve("../index.d.mts"),
  fs.readFileSync(resolve("../src/build/index.d.mts"))
);

fs.rmSync(resolve("../src"), { recursive: true });
