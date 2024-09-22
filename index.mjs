//@ts-check
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname } from "node:path";
export let import_meta_ponyfill = (importMeta) => {
  const resolveFunStr = String(importMeta.resolve);
  const shimWs = new WeakSet();
  const mainUrl = ("file:///" + process.argv[1].replace(/\\/g, "/")).replace(
    /\/{3,}/,
    "///"
  );
  const commonShim = (importMeta) => {
    if (typeof importMeta.main !== "boolean") {
      importMeta.main = importMeta.url === mainUrl;
    }
    if (typeof importMeta.filename !== "string") {
      importMeta.filename = fileURLToPath(importMeta.url);
      importMeta.dirname = dirname(importMeta.filename);
    }
  };
  if (
    // v16.2.0+, v14.18.0+: Add support for WHATWG URL object to parentURL parameter.
    resolveFunStr === "undefined" ||
    // v20.0.0+, v18.19.0+"" This API now returns a string synchronously instead of a Promise.
    resolveFunStr.startsWith("async")
    // enable by --experimental-import-meta-resolve flag
  ) {
    import_meta_ponyfill = (importMeta) => {
      if (!shimWs.has(importMeta)) {
        shimWs.add(importMeta);
        const importMetaUrlRequire = {
          url: importMeta.url,
          require: createRequire(importMeta.url),
        };
        importMeta.resolve = (specifier, parentURL = importMeta.url) => {
          return pathToFileURL(
            (importMetaUrlRequire.url === parentURL
              ? importMetaUrlRequire.require
              : createRequire(parentURL)
            ).resolve(specifier)
          ).href;
        };
        commonShim(importMeta);
      }
      return importMeta;
    };
  } else {
    // native support
    import_meta_ponyfill = (importMeta) => {
      if (!shimWs.has(importMeta)) {
        shimWs.add(importMeta);
        commonShim(importMeta);
      }
      return importMeta;
    };
  }
  return import_meta_ponyfill(importMeta);
};
