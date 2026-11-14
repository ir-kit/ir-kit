# @ir-kit/kit

## 1.1.0

### Minor Changes

- 4c4d1e0: `Events` now carries the spec's AMQP exchange, queue and operation bindings, and `assertExchanges`, `bindAndConsume` and `publish` apply them unless you pass your own options.

### Patch Changes

- 4c4d1e0: AsyncAPI 2.x messages that have a `name` but no `messageId` no longer crash the `events()` plugin or come out as `UndefinedMessage` in native models.

## 1.0.0

### Major Changes

- 2189dd2: `getEnumLiterals` moved from `@ir-kit/kit/openapi-tools` to `@ir-kit/kit/schema`, and the unused `isEnumSchema` and `isUnionSchema` were removed.
- 2189dd2: `ir generate --check` writes nothing and fails when committed output is stale, replacing the removed `sdk-regen` and `asyncapi-regen` GitHub Actions.
- e31cee6: `ir generate` regenerates every target listed in `ir.config.ts`: `go`, `kotlin`, `swift`, `java`, `typescript`, `k6`, `docs` and `asyncapi`.
- 2189dd2: `ir init` writes a starter config (and a starter loadtest with the `k6` target), replacing `@ir-kit/create-k6`, which is no longer published.
- 2189dd2: `IR.Schema` from `@ir-kit/kit/ir` is now JSON Schema 2020-12, the same type as `Schema` from `@ir-kit/kit/schema`.
- 2189dd2: `ir.config.ts` and `fn-schema.config.ts` load with Node's own TypeScript support instead of `c12`, and rc files such as `.fn-schemarc` are no longer read.
- 2189dd2: Prompts only appear in a terminal, and elsewhere a missing argument is an error.
- 2189dd2: ir-kit requires Node 24.
- 2189dd2: The `ir` command now comes with `@ir-kit/kit` instead of `@ir-kit/cli`.
- 2189dd2: `@ir-kit/k6` stays a separate package because it runs inside k6, and the old `@ir-kit/*` packages are removed from npm.
- 2189dd2: TypeSpec, the AsyncAPI parser, Postman converters, ts-morph and the Hey API plugin peers are optional dependencies that you install only for the features that use them.
- c0876e3: Every tool now ships in one package, `@ir-kit/kit`, with subpaths such as `@ir-kit/kit/spec`, `@ir-kit/kit/sdk/go`, `@ir-kit/kit/openapi-ts/faker`, `@ir-kit/kit/fn-schema` and `@ir-kit/kit/recon` replacing the old `@ir-kit/*` packages.

### Minor Changes

- 1d060b1: `ir sdk <lang>`, `ir sdk all` and `ir generate` now accept an AsyncAPI file and write one model type per message payload and named component schema.
- 4899c68: Removed the unused `diffSpecs` and `parseSpec` from `@ir-kit/kit/openapi-tools` in favor of `diffSpecs` from `@ir-kit/kit/spec` and `parseOpenAPI` from `@ir-kit/kit/ir`.
- 2189dd2: `defineConfig` is exported from `@ir-kit/kit`, and `generate`, `loadIrConfig` and `watch` from `@ir-kit/kit/generate`.
- 2189dd2: `ir watch` regenerates when the spec or config changes.
- 2189dd2: File matching and watching use `fs.glob` and `fs.watch` instead of `tinyglobby` and `chokidar`, and the fn-schema Vite plugin uses Vite's own watcher.
- 2189dd2: Route matching uses the global `URLPattern` instead of `urlpattern-polyfill`.
- e4b0574: The Go, Kotlin, Swift, Java and k6 generators read ir-kit's own API model from `@ir-kit/kit/ir`, where each operation lists its accepted security schemes in `securitySchemes`.

### Patch Changes

- 0ce856b: The AsyncAPI TypeScript output now imports its own files with `.js` extensions, so it runs under plain Node ESM after `tsc`.
- 2189dd2: `ir watch` now picks up edits to CommonJS config files.
- 29a1518: `ir init` writes `ir.config.mts` when `package.json` isn't `"type": "module"`, so the config loads without errors or warnings after `npm init`.
- 2189dd2: `ir fn-schema extract` now uses `out` and `format` from `fn-schema.config.ts` when no output flag is passed.
- 29a1518: `ir k6 bundle --output` now sets the output directory; before, it was ignored and the bundle always went to `dist`.
- 29a1518: `ir spec convert` from `.proto` to OpenAPI now points every `$ref` at a schema it writes when the file has a `package` or imports Google's well-known types, and maps `google.protobuf.Timestamp` to a `date-time` string.
- 2189dd2: The Go, Kotlin, Swift and Java SDKs now send auth for operations that rely on the document's top-level `security`.
