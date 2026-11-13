# @ir-kit/fn-schema-loader

## 0.1.3

### Patch Changes

- c218e3b: `safeRelativeDir` now lives in `@ir-kit/codegen-core`, and the Go, Kotlin and Swift generators share it. A Go `fileLocation` directory such as `./api` is now written as `api`, the same as in Kotlin and Swift. Spec converters that read a file (`.tsp`, `.proto`, Postman collections) now receive the path directly. When `fn-schema extract` finds no files, its result now includes `definitions: {}` and `stats.functionsFound: 0`. Dropped dependencies these packages never imported: `fn-schema-loader` and `fn-schema-transformer` no longer pull in the other fn-schema packages, `openapi-ts-paths` no longer asks for `@hey-api/codegen-core`, and `k6-toolkit` and `openapi-typescript` lose an unused dependency each.

## 0.1.2

### Patch Changes

- Updated dependencies [41c770f]
  - @ir-kit/fn-schema-core@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [f1fefb5]
  - @ir-kit/fn-schema-core@0.2.0
