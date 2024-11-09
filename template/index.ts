import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { dirname as path_dirname, resolve } from "node:path";

interface AnyImportMeta {
  url: string;
  resolve(specifier: string): unknown;
  filename?: string;
  dirname?: string;
  main?: boolean;
}
export interface PonyfillImportMeta {
  /** A string representation of the fully qualified module URL. When the
   * module is loaded locally, the value will be a file URL (e.g.
   * `file:///path/module.ts`).
   *
   * You can also parse the string as a URL to determine more information about
   * how the current module was loaded. For example to determine if a module was
   * local or not:
   *
   * ```ts
   * const url = new URL(import.meta.url);
   * if (url.protocol === "file:") {
   *   console.log("this module was loaded locally");
   * }
   * ```
   */
  url: string;
  /**
   * A function that returns the resolved specifier,
   * see [`import.meta.resolve(specifier)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve),
   * even attempting to return a result for non-existent paths.
   *
   * ```ts
   * console.log(import.meta.resolve("./foo.js"));
   * // file:///dev/foo.js
   * ```
   *
   * @param specifier The module specifier to resolve relative to `parent`.
   * @param parent The absolute parent module URL to resolve from.
   * @returns The absolute (`file:`) URL string for the resolved module.
   */
  resolve(specifier: string, parent?: string | URL | undefined): string;
  /**
   * A function that returns resolved specifier as if it would be imported
   * using `import.meta.resolve(specifier) or require.resolve(specifier)`.
   *
   * ```ts
   * console.log(import.meta.nodeResolve("./foo.js"));
   * // file:///dev/foo.js
   * ```
   *
   * @param specifier The module specifier to resolve relative to `parent`.
   * @param parent The absolute parent module URL to resolve from.
   * @returns The absolute (`file:`) URL string for the resolved module.
   */
  nodeResolve(specifier: string, parent?: string | URL | undefined): string;
  /** A flag that indicates if the current module is the main module that was
   * called when starting the program under Deno.
   *
   * ```ts
   * if (import.meta.main) {
   *   // this was loaded as the main module, maybe do some bootstrapping
   * }
   * ```
   */
  main: boolean;

  /** The absolute path of the current module.
   *
   * This property is only provided for local modules (ie. using `file://` URLs).
   *
   * Example:
   * ```
   * // Unix
   * console.log(import.meta.filename); // /home/alice/my_module.ts
   *
   * // Windows
   * console.log(import.meta.filename); // C:\alice\my_module.ts
   * ```
   */
  filename: string;

  /** The absolute path of the directory containing the current module.
   *
   * This property is only provided for local modules (ie. using `file://` URLs).
   *
   * * Example:
   * ```
   * // Unix
   * console.log(import.meta.dirname); // /home/alice
   *
   * // Windows
   * console.log(import.meta.dirname); // C:\alice
   * ```
   */
  dirname: string;
}

type NodeRequest = ReturnType<typeof createRequire>;
type NodeModule = NonNullable<NodeRequest["main"]>;
type ImportMetaPonyfillCommonjs = (
  require: NodeRequest,
  module: NodeModule,
) => PonyfillImportMeta;
type ImportMetaPonyfillEsmodule = (
  importMeta: AnyImportMeta,
) => PonyfillImportMeta;

const pathResolve = (specifier: string, parentURL: URL | string) => {
  let baseUrl: URL | string;
  if (parentURL instanceof URL) {
    baseUrl = parentURL;
  } else {
    const parentHref = String(parentURL);
    if (parentHref.startsWith("file:")) {
      baseUrl = parentHref;
    } else {
      baseUrl = pathToFileURL(parentHref).href;
    }
  }
  return new URL(specifier, baseUrl).href;
};

export const import_meta_ponyfill_commonjs = (Reflect.get(
  globalThis,
  Symbol.for("import-meta-ponyfill-commonjs"),
) ??
  (() => {
    const moduleImportMetaWM = new WeakMap<NodeModule, PonyfillImportMeta>();
    return (require, module) => {
      let importMetaCache = moduleImportMetaWM.get(module);
      if (importMetaCache == null) {
        const importMeta: PonyfillImportMeta = Object.assign(
          Object.create(null),
          {
            url: pathToFileURL(module.filename).href,
            main: require.main === module,
            nodeResolve(
              specifier: string,
              parentURL: URL | string = importMeta.url,
            ) {
              return pathToFileURL(
                (importMeta.url === parentURL
                  ? require
                  : createRequire(parentURL)).resolve(specifier),
              ).href;
            },
            resolve: function resolve(
              specifier: string,
              parentURL: URL | string = importMeta.url,
            ) {
              if (/^[./]*\/.*/.test(specifier)) {
                return pathResolve(specifier, parentURL);
              }
              try {
                return importMeta.nodeResolve(specifier, parentURL);
              } catch {
                return pathResolve(specifier, parentURL);
              }
            },
            filename: module.filename,
            dirname: module.path,
          },
        );
        moduleImportMetaWM.set(module, importMeta);
        importMetaCache = importMeta;
      }
      return importMetaCache;
    };
  })()) as ImportMetaPonyfillCommonjs;

export let import_meta_ponyfill_esmodule = (Reflect.get(
  globalThis,
  Symbol.for("import-meta-ponyfill-esmodule"),
) ??
  ((importMeta: ImportMeta) => {
    const resolveFunStr = String(importMeta.resolve);
    const importMetaWM = new WeakMap<object, PonyfillImportMeta>();
    const mainUrl = `file:///${process.argv[1].replace(/\\/g, "/")}`.replace(
      /\/{3,}/,
      "///",
    );
    const isSupportResolve = // v16.2.0+, v14.18.0+: Add support for WHATWG URL object to parentURL parameter.
      resolveFunStr !== "undefined" &&
      // v20.0.0+, v18.19.0+"" This API now returns a string synchronously instead of a Promise.
      !resolveFunStr.startsWith("async");
    // enable by --experimental-import-meta-resolve flag

    import_meta_ponyfill_esmodule = (im: AnyImportMeta) => {
      let importMetaCache = importMetaWM.get(im);
      if (importMetaCache == null) {
        const filename: string = im.filename ?? fileURLToPath(im.url);
        const dirname: string = im.dirname ?? path_dirname(filename);
        const importMeta: PonyfillImportMeta = {
          url: im.url,
          main: im.main ?? im.url === mainUrl,
          filename,
          dirname,
          nodeResolve: isSupportResolve ? im.resolve as PonyfillImportMeta['resolve'] : (() => {
            const importMetaUrlRequire = createRequire(im.url);
            return (
              specifier: string,
              parentURL: string | URL = im.url,
            ) => {
              return pathToFileURL(
                (importMeta.url === parentURL
                  ? importMetaUrlRequire
                  : createRequire(parentURL)).resolve(specifier),
              ).href;
            };
          })(),
          resolve: function resolve(
            specifier: string,
            parentURL: URL | string = im.url,
          ) {
            if (/^[./]*\/.*/.test(specifier)) {
              return pathResolve(specifier, parentURL);
            }
            try {
              return importMeta.nodeResolve(specifier, parentURL);
            } catch {
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
  })) as ImportMetaPonyfillEsmodule;
