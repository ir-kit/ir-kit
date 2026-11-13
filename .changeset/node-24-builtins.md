---
"ir-kit": major
---

Require Node 24 and use its built-ins instead of six libraries:

- `ir.config.ts` and `fn-schema.config.ts` load with Node's own TypeScript support instead of `c12`. Only `<name>.config.{ts,mts,js,mjs}` files are read; rc files are no longer looked up.
- File matching and watching use `fs.glob` and `fs.watch` instead of `tinyglobby` and `chokidar`. The fn-schema Vite plugin uses Vite's own watcher.
- Route matching uses the global `URLPattern` instead of `urlpattern-polyfill`.
- CLI output and prompts use `node:util` and `node:readline` instead of `consola` and `@clack/prompts`. Prompts only appear in a terminal; elsewhere a missing argument is an error.

Also fixed: `out` and `format` in `fn-schema.config.ts` were ignored. `ir fn-schema extract` now writes there when no output flag is passed.
