# import.meta shim lib

This library implements some standard interfaces of [import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) with the aim of resolving the confusion caused by multiple standards in Node.js.
It includes unified support for the following Node.js standards:

## How to use

- commonjs
  ```ts
  const { import_meta_ponyfill } = require("import-meta-ponyfill");
  const importMeta = import_meta_ponyfill(require, __filename);
  importMeta.resolve; // function
  importMeta.main; // boolean
  importMeta.url; // string
  importMeta.filename; // string
  importMeta.dirname; // string
  ```
- esmodule
  ```ts
  import { import_meta_ponyfill } from "import-meta-ponyfill";
  const importMeta = import_meta_ponyfill(import.meta);
  ```
  - v20.6.0, v18.19.0
    > Unflag import.meta.resolve, with parentURL parameter still flagged.
  - v20.6.0, v18.19.0
    > This API no longer throws when targeting file: URLs that do not map to an existing file on the local FS.
  - v20.0.0, v18.19.0
    > This API now returns a string synchronously instead of a Promise.
  - v16.2.0, v14.18.0
    > Add support for WHATWG URL object to parentURL parameter.

## ImportMeta API

- `url: string;`
  > A string representation of the fully qualified module URL. When the
  > module is loaded locally, the value will be a file URL (e.g.
  > `file:///path/module.ts`).
  >
  > You can also parse the string as a URL to determine more information about
  > how the current module was loaded. For example to determine if a module was
  > local or not:
  >
  > ```ts
  > const url = new URL(importMeta.url);
  > if (url.protocol === "file:") {
  >   console.log("this module was loaded locally");
  > }
  > ```
- `resolve(specifier: string, parent?: string | URL | undefined): string;`
  > A function that returns resolved specifier as if it would be imported
  > using `import(specifier)`.
  >
  > ```ts
  > console.log(importMeta.resolve("./foo.js"));
  > // file:///dev/foo.js
  > ```
  >
  > @param specifier The module specifier to resolve relative to `parent`.
  > @param parent The absolute parent module URL to resolve from.
  > @returns The absolute (`file:`) URL string for the resolved module.
- `main: boolean;`
  > A flag that indicates if the current module is the main module that was
  > called when starting the program under Deno.
  >
  > ```ts
  > if (importMeta.main) {
  >   // this was loaded as the main module, maybe do some bootstrapping
  > }
  > ```
- `filename: string;`

  > The absolute path of the current module.
  >
  > This property is only provided for local modules (ie. using `file://` URLs).
  >
  > Example:
  >
  > ```ts
  > // Unix
  > console.log(importMeta.filename); // /home/alice/my_module.ts
  >
  > // Windows
  > console.log(importMeta.filename); // C:\alice\my_module.ts
  > ```

- `dirname: string;`
  > The absolute path of the directory containing the current module.
  >
  > This property is only provided for local modules (ie. using `file://` URLs).
  >
  > > Example:
  >
  > ```ts
  > // Unix
  > console.log(importMeta.dirname); // /home/alice
  >
  > // Windows
  > console.log(importMeta.dirname); // C:\alice
  > ```
