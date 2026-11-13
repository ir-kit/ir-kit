# @ir-kit/openapi-typescript

## 0.4.1

### Patch Changes

- c218e3b: `safeRelativeDir` now lives in `@ir-kit/codegen-core`, and the Go, Kotlin and Swift generators share it. A Go `fileLocation` directory such as `./api` is now written as `api`, the same as in Kotlin and Swift. Spec converters that read a file (`.tsp`, `.proto`, Postman collections) now receive the path directly. When `fn-schema extract` finds no files, its result now includes `definitions: {}` and `stats.functionsFound: 0`. Dropped dependencies these packages never imported: `fn-schema-loader` and `fn-schema-transformer` no longer pull in the other fn-schema packages, `openapi-ts-paths` no longer asks for `@hey-api/codegen-core`, and `k6-toolkit` and `openapi-typescript` lose an unused dependency each.
  - @ir-kit/openapi@0.6.1
  - @ir-kit/openapi-loader@0.4.2

## 0.4.0

### Minor Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.

### Patch Changes

- Updated dependencies [253ace2]
  - @ir-kit/openapi@0.6.0
  - @ir-kit/openapi-tools@0.5.0
  - @ir-kit/openapi-loader@0.4.1

## 0.3.0

### Minor Changes

- 236f15d: Support `@hey-api/openapi-ts` 0.99, `@hey-api/shared` 0.5 and `@hey-api/codegen-core` 0.9, which the peer ranges now require.
  - External imports (`@orpc/*`, `@faker-js/faker`, `typia`, `@standard-schema/spec`) are declared through the plugin `imports` API instead of `plugin.external()`.
  - `defineConfig()` resolves user options against the defaults, so a partial nested object such as `server: { handlers: { mode: "faker" } }` keeps the defaults for the keys it leaves out.
  - The typia plugin finds `@hey-api/typescript` types again; under 0.99 it generated nothing.
  - The oRPC WebSocket and MessagePort clients import `RPCLink` instead of the nonexistent `RPCLinkWebSocket` and `RPCLinkMessagePort` exports.
  - The orpc, paths and typia packages load under plain Node ESM, since their compiled relative imports now carry `.js` extensions.

### Patch Changes

- 700a292: Keep unquoted YAML dates (such as Stripe's `api_version` enum) as strings instead of `Date` objects, which code generation dropped. The TypeScript target now loads specs with `@ir-kit/openapi-loader` like the native targets, so relative paths such as `specs/api.yaml` are no longer read as Hey API registry shorthands, external `$ref`s inside `x-` extensions are ignored, and specs that crashed Hey API's own loader (DigitalOcean) generate.
- Updated dependencies [238d15f]
- Updated dependencies [700a292]
- Updated dependencies [2a7c7cf]
- Updated dependencies [c9bd617]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
  - @ir-kit/openapi-tools@0.4.0
  - @ir-kit/openapi-loader@0.4.0
  - @ir-kit/openapi@0.5.0

## 0.2.1

### Patch Changes

- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
- Updated dependencies [86fa954]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/openapi@0.4.0
  - @ir-kit/openapi-tools@0.3.1

## 0.2.0

### Minor Changes

- ed1a86c: `ir sdk <target>` commands — SDK generation for every target through one binary.
  - `ir sdk go|kotlin|swift|typescript|k6` — schema-driven flags, each wraps the matching `@ir-kit/openapi-*` `generate()`.
  - `ir sdk all --targets go,kotlin,...` — multi-target dispatch; one input, parallel outputs under `<output>/<target>/`.
  - All `sdk` commands route input through `@ir-kit/spec-loader`, so `.tsp` files compile-on-the-fly via `@ir-kit/typespec-loader`. URL / file path / pre-parsed object all accepted.
  - `@ir-kit/openapi-typescript`: widened `input` type to accept pre-parsed objects (matches the other emitters' shape).

- 61c113a: Extract spec loading into format-specific packages and add TypeSpec input support across all OpenAPI generators.
  - New `@ir-kit/typespec-loader`: compiles a `.tsp` entry point (file path or in-memory source) to an OpenAPI 3 document via `@typespec/compiler` + `@typespec/openapi3`. Programmatic API primary; CLI bin `typespec-to-openapi` wraps it.
  - New `@ir-kit/openapi-loader`: `loadOpenAPI({ input, normalize })` — `$RefParser` bundle + optional hey-api-aware normalize. Moved out of `@ir-kit/openapi-tools`.
  - New `@ir-kit/asyncapi-loader`: `loadAsyncAPI({ input })` — wraps `@ir-kit/asyncapi-core`'s `parseSpecOrThrow` with path/URL dispatch. Replaces the inline loader in `@ir-kit/asyncapi-typescript`.
  - New `@ir-kit/spec-loader`: universal entry point — detects format by extension + content sniff, dispatches to the matching format-loader, returns a discriminated `{ kind, document }`.
  - `@ir-kit/openapi-tools` drops the `loadSpec` re-export (pre-1.0 clean break); consumers import from `@ir-kit/openapi-loader` directly.
  - All 5 OpenAPI generators (`-go`, `-kotlin`, `-swift`, `-typescript`, `@ir-kit/k6-gen`) and `@ir-kit/asyncapi-typescript` updated to use the new loaders.

### Patch Changes

- Updated dependencies [61c113a]
  - @ir-kit/openapi-loader@0.2.0
  - @ir-kit/openapi-tools@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies [64034d0]
  - @ir-kit/openapi@0.3.0
  - @ir-kit/openapi-tools@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [3bf4075]
  - @ir-kit/openapi@0.2.0
  - @ir-kit/openapi-tools@0.1.1
