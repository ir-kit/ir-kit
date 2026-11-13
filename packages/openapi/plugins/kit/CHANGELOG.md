# @ir-kit/openapi-ts-plugin-kit

## 0.2.0

### Minor Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.

## 0.1.0

### Minor Changes

- efb6fb5: Move the nested plugin config resolution the faker, orpc, paths and typia plugins each carried into the new `@ir-kit/openapi-ts-plugin-kit` package.
