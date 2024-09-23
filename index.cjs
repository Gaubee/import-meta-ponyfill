//@ts-check
const { createRequire } = require("node:module");
const { pathToFileURL } = require("node:url");

/**
 * @type {WeakMap<NodeJS.Module, import('./index.d.cts').ImportMeta>}
 */
const moduleImportMetaWM = new WeakMap();
/**
 *
 * @param {NodeJS.Require} require
 * @param {NodeJS.Module} module
 * @returns
 */
let import_meta_ponyfill = (require, module) => {
  let importMeta = moduleImportMetaWM.get(module);
  if (importMeta == null) {
    importMeta = Object.assign(Object.create(null), {
      url: pathToFileURL(module.filename).href,
      main: require.main == module,
      resolve: (specifier, parentURL = importMeta.url) => {
        return pathToFileURL(
          (importMeta.url === parentURL
            ? require
            : createRequire(parentURL)
          ).resolve(specifier)
        ).href;
      },
      filename: module.filename,
      dirname: module.path,
    });
    moduleImportMetaWM.set(module, importMeta);
  }
  return importMeta;
};
exports.import_meta_ponyfill = import_meta_ponyfill;
