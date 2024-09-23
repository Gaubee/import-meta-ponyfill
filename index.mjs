import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { dirname as path_dirname } from "node:path";
const pathResolve = (specifier, parentURL) => {
    let baseUrl;
    if (parentURL instanceof URL) {
        baseUrl = parentURL;
    }
    else {
        parentURL = String(parentURL);
        if (parentURL.startsWith("file:")) {
            baseUrl = parentURL;
        }
        else {
            baseUrl = pathToFileURL(parentURL).href;
        }
    }
    return new URL(specifier, baseUrl).href;
};
export const import_meta_ponyfill_commonjs = (Reflect.get(globalThis, Symbol.for("import-meta-ponyfill-commonjs")) ??
    (() => {
        const moduleImportMetaWM = new WeakMap();
        return (require, module) => {
            let importMetaCache = moduleImportMetaWM.get(module);
            if (importMetaCache == null) {
                const importMeta = Object.assign(Object.create(null), {
                    url: pathToFileURL(module.filename).href,
                    main: require.main === module,
                    nodeResolve(specifier, parentURL = importMeta.url) {
                        return pathToFileURL((importMeta.url === parentURL
                            ? require
                            : createRequire(parentURL)).resolve(specifier)).href;
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
export let import_meta_ponyfill_esmodule = (Reflect.get(globalThis, Symbol.for("import-meta-ponyfill-esmodule")) ??
    ((importMeta) => {
        const resolveFunStr = String(importMeta.resolve);
        const importMetaWM = new WeakMap();
        const mainUrl = `file:///${process.argv[1].replace(/\\/g, "/")}`.replace(/\/{3,}/, "///");
        const isSupportResolve = // v16.2.0+, v14.18.0+: Add support for WHATWG URL object to parentURL parameter.
         resolveFunStr !== "undefined" &&
            // v20.0.0+, v18.19.0+"" This API now returns a string synchronously instead of a Promise.
            !resolveFunStr.startsWith("async");
        // enable by --experimental-import-meta-resolve flag
        import_meta_ponyfill_esmodule = (im) => {
            let importMetaCache = importMetaWM.get(im);
            if (importMetaCache == null) {
                const filename = im.filename ?? fileURLToPath(im.url);
                const dirname = im.dirname ?? path_dirname(filename);
                const importMeta = {
                    url: im.url,
                    main: im.main ?? im.url === mainUrl,
                    filename,
                    dirname,
                    nodeResolve: isSupportResolve
                        ? im.resolve
                        : (() => {
                            const importMetaUrlRequire = createRequire(im.url);
                            return (specifier, parentURL = im.url) => {
                                return pathToFileURL((importMeta.url === parentURL
                                    ? importMetaUrlRequire
                                    : createRequire(parentURL)).resolve(specifier)).href;
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
        return import_meta_ponyfill_esmodule(importMeta);
    }));
export { import_meta_ponyfill_esmodule as import_meta_ponyfill };
export default import_meta_ponyfill_esmodule;
