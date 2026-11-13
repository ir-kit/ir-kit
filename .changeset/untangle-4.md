---
"@ir-kit/codegen-core": minor
"@ir-kit/openapi-go": patch
"@ir-kit/openapi-kotlin": patch
"@ir-kit/openapi-swift": patch
"@ir-kit/spec-convert": patch
"@ir-kit/fn-schema-core": patch
"@ir-kit/fn-schema-loader": patch
"@ir-kit/fn-schema-transformer": patch
"@ir-kit/k6-toolkit": patch
"@ir-kit/openapi-typescript": patch
"@ir-kit/openapi-ts-paths": patch
---

`safeRelativeDir` now lives in `@ir-kit/codegen-core`, and the Go, Kotlin and Swift generators share it. A Go `fileLocation` directory such as `./api` is now written as `api`, the same as in Kotlin and Swift. Spec converters that read a file (`.tsp`, `.proto`, Postman collections) now receive the path directly. When `fn-schema extract` finds no files, its result now includes `definitions: {}` and `stats.functionsFound: 0`. Dropped dependencies these packages never imported: `fn-schema-loader` and `fn-schema-transformer` no longer pull in the other fn-schema packages, `openapi-ts-paths` no longer asks for `@hey-api/codegen-core`, and `k6-toolkit` and `openapi-typescript` lose an unused dependency each.
