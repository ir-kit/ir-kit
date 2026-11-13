---
"@ir-kit/asyncapi-typescript": major
"@ir-kit/openapi-ts-faker": major
"@ir-kit/openapi-ts-orpc": major
"@ir-kit/openapi-ts-typia": major
"@ir-kit/openapi-go": major
"@ir-kit/openapi-java": major
"@ir-kit/openapi-kotlin": major
"@ir-kit/openapi-swift": major
"@ir-kit/k6-gen": minor
"@ir-kit/k6-toolkit": minor
"@ir-kit/openapi-ts-k6": minor
"@ir-kit/openapi": minor
"@ir-kit/openapi-ts-plugin-kit": minor
"@ir-kit/openapi-ts-paths": minor
"@ir-kit/openapi-recon": minor
"@ir-kit/openapi-tools": minor
"@ir-kit/openapi-typescript": minor
"@ir-kit/schema": minor
"@ir-kit/spec-convert": minor
"@ir-kit/create-k6": patch
---

Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.
