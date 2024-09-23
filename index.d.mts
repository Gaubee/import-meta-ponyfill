import { createRequire } from "node:module";
import { URL } from "node:url";
declare global {
    interface ImportMeta {
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
         *
         * A function that returns resolved specifier as if it would be imported
         * using `import.meta.resolve(specifier) or require.resolve(specifier)`.
         *
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
}
type NodeRequest = ReturnType<typeof createRequire>;
type NodeModule = NonNullable<NodeRequest["main"]>;
type ImportMetaPonyfillCommonjs = (require: NodeRequest, module: NodeModule) => ImportMeta;
type ImportMetaPonyfillEsmodule = (importMeta: ImportMeta) => ImportMeta;
export declare const import_meta_ponyfill_commonjs: ImportMetaPonyfillCommonjs;
export declare let import_meta_ponyfill_esmodule: ImportMetaPonyfillEsmodule;
export { import_meta_ponyfill_esmodule as import_meta_ponyfill };
export default import_meta_ponyfill_esmodule;
