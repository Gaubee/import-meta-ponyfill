//@ts-check
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");
const { dirname } = require("node:path");

const requireImportMetaWM = new WeakMap();
let import_meta_ponyfill = (require, filename) => {
  let importMeta = requireImportMetaWM.get(require);
  if (importMeta == null) {
    importMeta = Object.assign(Object.create(null), {
      url: pathToFileURL(filename).href,
      main: require.main.filename == filename,
      resolve: (specifier, parentURL = importMeta.url) => {
        return pathToFileURL(
          (importMeta.url === parentURL
            ? require
            : createRequire(parentURL)
          ).resolve(specifier)
        ).href;
      },
      filename,
      dirname: dirname(filename),
    });
    requireImportMetaWM.set(require, importMeta);
  }
  return importMeta;
};
exports.import_meta_ponyfill = import_meta_ponyfill;
