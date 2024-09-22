# import.meta shim lib

This library implements some standard interfaces of [import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) with the aim of resolving the confusion caused by multiple standards in Node.js.
It includes unified support for the following Node.js standards:

- commonjs
  ```ts
  import_meta_ponyfill(require, __filename);
  ```
- esmodule
  ```ts
  import_meta_ponyfill(import.meta);
  ```
  - v20.6.0, v18.19.0
    > Unflag import.meta.resolve, with parentURL parameter still flagged.
  - v20.6.0, v18.19.0
    > This API no longer throws when targeting file: URLs that do not map to an existing file on the local FS.
  - v20.0.0, v18.19.0
    > This API now returns a string synchronously instead of a Promise.
  - v16.2.0, v14.18.0
    > Add support for WHATWG URL object to parentURL parameter.
