# @ir-kit/fn-schema-core

## 0.2.2

### Patch Changes

- b7b4d52: `runInspect` merges `identity`/`transport` flags with config the same way `runExtract` does, so `inspect` shows the schema `extract` writes: `""` or `"false"` turns a keyword off instead of being used as its name, and an unset keyword is off unless the config sets it.
- c218e3b: `safeRelativeDir` now lives in `@ir-kit/codegen-core`, and the Go, Kotlin and Swift generators share it. A Go `fileLocation` directory such as `./api` is now written as `api`, the same as in Kotlin and Swift. Spec converters that read a file (`.tsp`, `.proto`, Postman collections) now receive the path directly. When `fn-schema extract` finds no files, its result now includes `definitions: {}` and `stats.functionsFound: 0`. Dropped dependencies these packages never imported: `fn-schema-loader` and `fn-schema-transformer` no longer pull in the other fn-schema packages, `openapi-ts-paths` no longer asks for `@hey-api/codegen-core`, and `k6-toolkit` and `openapi-typescript` lose an unused dependency each.

## 0.2.1

### Patch Changes

- 41c770f: `runExtract`, `runScan` and `runInspect` resolve their source files through one `listSourceFiles` helper, and an empty scan's stats now include `functionsFound: 0`.

## 0.2.0

### Minor Changes

- f1fefb5: Consolidate fn-schema into the unified `ir` CLI. `@ir-kit/fn-schema-cli` is deleted; orchestration moved into `@ir-kit/fn-schema-core` as programmatic `runExtract()` / `runScan()` / `runInspect()` / `runDiff()`. New `ir fn-schema {extract,scan,inspect,diff}` commands wrap them.
