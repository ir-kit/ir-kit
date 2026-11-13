# @ir-kit/codegen-core

## 0.4.0

### Minor Changes

- c218e3b: `safeRelativeDir` now lives in `@ir-kit/codegen-core`, and the Go, Kotlin and Swift generators share it. A Go `fileLocation` directory such as `./api` is now written as `api`, the same as in Kotlin and Swift. Spec converters that read a file (`.tsp`, `.proto`, Postman collections) now receive the path directly. When `fn-schema extract` finds no files, its result now includes `definitions: {}` and `stats.functionsFound: 0`. Dropped dependencies these packages never imported: `fn-schema-loader` and `fn-schema-transformer` no longer pull in the other fn-schema packages, `openapi-ts-paths` no longer asks for `@hey-api/codegen-core`, and `k6-toolkit` and `openapi-typescript` lose an unused dependency each.

## 0.3.0

### Minor Changes

- 41c770f: `codegen-core` exports `writeOutput(out, files, { clean })`, and the Go, Java, Kotlin and Swift generators write their output through it instead of each repeating the clean-and-write loop.

## 0.2.0

### Minor Changes

- 86fa954: Type names now resolve through a per-run `Namespace` keyed by semantic identity: component schemas, `$ref`s and synthesized inline types always agree on spelling, invalid source names (`properties-store`) become valid identifiers, and clashes get deterministic suffixes instead of duplicate declarations. Enum classification is total — boolean, number and mixed enums degrade to their value type instead of throwing, and clashing entry names are disambiguated. `assertNoEnumCollisions` is replaced by `uniqueEnumEntries`.
