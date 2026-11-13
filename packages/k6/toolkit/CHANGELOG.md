# @ir-kit/k6-toolkit

## 0.3.1

### Patch Changes

- c218e3b: `safeRelativeDir` now lives in `@ir-kit/codegen-core`, and the Go, Kotlin and Swift generators share it. A Go `fileLocation` directory such as `./api` is now written as `api`, the same as in Kotlin and Swift. Spec converters that read a file (`.tsp`, `.proto`, Postman collections) now receive the path directly. When `fn-schema extract` finds no files, its result now includes `definitions: {}` and `stats.functionsFound: 0`. Dropped dependencies these packages never imported: `fn-schema-loader` and `fn-schema-transformer` no longer pull in the other fn-schema packages, `openapi-ts-paths` no longer asks for `@hey-api/codegen-core`, and `k6-toolkit` and `openapi-typescript` lose an unused dependency each.
  - @ir-kit/k6-gen@0.5.1
  - @ir-kit/openapi-loader@0.4.2
  - @ir-kit/openapi-tools@0.5.1

## 0.3.0

### Minor Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.
- 253ace2: Build the client, types, data and loadtest scaffolds with Hey API's `$` DSL and renderer, and drop the `typescript` peer dependency. Generated files now use single quotes. `@ir-kit/k6-gen/ast` import helpers return `ModuleImport` objects for the new `printModule`, `printLoadtest` replaces `reExportConst`/`defaultExportProp`, and `Expr`/`TypeExpr` name the DSL value and type shapes.

  Loadtest stub headers now keep multi-line operation summaries on one comment line; before, they broke out of the comment and the stub failed to parse.

### Patch Changes

- Updated dependencies [253ace2]
- Updated dependencies [253ace2]
  - @ir-kit/k6-gen@0.5.0
  - @ir-kit/openapi-tools@0.5.0
  - @ir-kit/openapi-loader@0.4.1

## 0.2.3

### Patch Changes

- c8bb71b: - `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
  - `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
  - `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
  - k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.
- Updated dependencies [c8bb71b]
  - @ir-kit/k6-gen@0.4.1

## 0.2.2

### Patch Changes

- 41c770f: `k6-gen` exports its TypeScript AST helpers from `@ir-kit/k6-gen/ast`, and `k6-toolkit` uses them instead of keeping its own copies.
- Updated dependencies [238d15f]
- Updated dependencies [700a292]
- Updated dependencies [c9bd617]
- Updated dependencies [41c770f]
  - @ir-kit/openapi-tools@0.4.0
  - @ir-kit/openapi-loader@0.4.0
  - @ir-kit/k6-gen@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/k6-gen@0.3.1
  - @ir-kit/openapi-tools@0.3.1

## 0.2.0

### Minor Changes

- f1fefb5: Consolidate k6 tooling into the unified `ir` CLI. `@ir-kit/k6-toolkit` drops the `k6-ts` bin; the scaffold wizard / sync / bundle commands now live under `ir k6 {sync,bundle}` as schema-driven wrappers around the toolkit's programmatic API.

### Patch Changes

- Updated dependencies [61c113a]
  - @ir-kit/openapi-loader@0.2.0
  - @ir-kit/openapi-tools@0.3.0
  - @ir-kit/k6-gen@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies [64034d0]
  - @ir-kit/openapi-tools@0.2.0
  - @ir-kit/k6-gen@0.2.0

## 0.1.1

### Patch Changes

- @ir-kit/k6-gen@0.1.1
- @ir-kit/openapi-tools@0.1.1
