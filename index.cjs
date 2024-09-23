"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.import_meta_ponyfill = exports.import_meta_ponyfill_esmodule = exports.import_meta_ponyfill_commonjs = void 0;
const node_module_1 = require("node:module");
const node_url_1 = require("node:url");
const node_path_1 = require("node:path");
const pathResolve = (specifier, parentURL) => {
    let baseUrl;
    if (parentURL instanceof node_url_1.URL) {
        baseUrl = parentURL;
    }
    else {
        parentURL = String(parentURL);
        if (parentURL.startsWith("file:")) {
            baseUrl = parentURL;
        }
        else {
            baseUrl = (0, node_url_1.pathToFileURL)(parentURL).href;
        }
    }
    return new node_url_1.URL(specifier, baseUrl).href;
};
exports.import_meta_ponyfill_commonjs = (Reflect.get(globalThis, Symbol.for("import-meta-ponyfill-commonjs")) ??
    (() => {
        const moduleImportMetaWM = new WeakMap();
        return (require, module) => {
            let importMetaCache = moduleImportMetaWM.get(module);
            if (importMetaCache == null) {
                const importMeta = Object.assign(Object.create(null), {
                    url: (0, node_url_1.pathToFileURL)(module.filename).href,
                    main: require.main === module,
                    nodeResolve(specifier, parentURL = importMeta.url) {
                        return (0, node_url_1.pathToFileURL)((importMeta.url === parentURL
                            ? require
                            : (0, node_module_1.createRequire)(parentURL)).resolve(specifier)).href;
                    },
                    resolve: function resolve(specifier, parentURL = importMeta.url) {
                        if (/^[./]*\/.*/.test(specifier)) {
                            return pathResolve(specifier, parentURL);
                        }
                        try {
                            return importMeta.nodeResolve(specifier, parentURL);
                        }
                        catch {
                            return pathResolve(specifier, parentURL);
                        }
                    },
                    filename: module.filename,
                    dirname: module.path,
                });
                moduleImportMetaWM.set(module, importMeta);
                importMetaCache = importMeta;
            }
            return importMetaCache;
        };
    })());
exports.import_meta_ponyfill = exports.import_meta_ponyfill_commonjs;
exports.import_meta_ponyfill_esmodule = (Reflect.get(globalThis, Symbol.for("import-meta-ponyfill-esmodule")) ??
    ((importMeta) => {
        const resolveFunStr = String(importMeta.resolve);
        const importMetaWM = new WeakMap();
        const mainUrl = `file:///${process.argv[1].replace(/\\/g, "/")}`.replace(/\/{3,}/, "///");
        const isSupportResolve = // v16.2.0+, v14.18.0+: Add support for WHATWG URL object to parentURL parameter.
         resolveFunStr !== "undefined" &&
            // v20.0.0+, v18.19.0+"" This API now returns a string synchronously instead of a Promise.
            !resolveFunStr.startsWith("async");
        // enable by --experimental-import-meta-resolve flag
        exports.import_meta_ponyfill_esmodule = (im) => {
            let importMetaCache = importMetaWM.get(im);
            if (importMetaCache == null) {
                const filename = im.filename ?? (0, node_url_1.fileURLToPath)(im.url);
                const dirname = im.dirname ?? (0, node_path_1.dirname)(filename);
                const importMeta = {
                    url: im.url,
                    main: im.main ?? im.url === mainUrl,
                    filename,
                    dirname,
                    nodeResolve: isSupportResolve
                        ? im.resolve
                        : (() => {
                            const importMetaUrlRequire = (0, node_module_1.createRequire)(im.url);
                            return (specifier, parentURL = im.url) => {
                                return (0, node_url_1.pathToFileURL)((importMeta.url === parentURL
                                    ? importMetaUrlRequire
                                    : (0, node_module_1.createRequire)(parentURL)).resolve(specifier)).href;
                            };
                        })(),
                    resolve: function resolve(specifier, parentURL = im.url) {
                        if (/^[./]*\/.*/.test(specifier)) {
                            return pathResolve(specifier, parentURL);
                        }
                        try {
                            return importMeta.nodeResolve(specifier, parentURL);
                        }
                        catch {
                            return pathResolve(specifier, parentURL);
                        }
                    },
                };
                importMetaCache = importMeta;
                importMetaWM.set(im, importMeta);
            }
            return importMetaCache;
        };
        return (0, exports.import_meta_ponyfill_esmodule)(importMeta);
    }));
exports.default = exports.import_meta_ponyfill_commonjs;

module.exports = Object.assign(exports.import_meta_ponyfill_commonjs, exports);
