# @ir-kit/openapi-ts-paths

## 0.3.0

### Minor Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.

### Patch Changes

- Updated dependencies [253ace2]
  - @ir-kit/openapi-ts-plugin-kit@0.2.0

## 0.2.0

### Minor Changes

- 236f15d: Support `@hey-api/openapi-ts` 0.99, `@hey-api/shared` 0.5 and `@hey-api/codegen-core` 0.9, which the peer ranges now require.
  - External imports (`@orpc/*`, `@faker-js/faker`, `typia`, `@standard-schema/spec`) are declared through the plugin `imports` API instead of `plugin.external()`.
  - `defineConfig()` resolves user options against the defaults, so a partial nested object such as `server: { handlers: { mode: "faker" } }` keeps the defaults for the keys it leaves out.
  - The typia plugin finds `@hey-api/typescript` types again; under 0.99 it generated nothing.
  - The oRPC WebSocket and MessagePort clients import `RPCLink` instead of the nonexistent `RPCLinkWebSocket` and `RPCLinkMessagePort` exports.
  - The orpc, paths and typia packages load under plain Node ESM, since their compiled relative imports now carry `.js` extensions.

### Patch Changes

- efb6fb5: Move the nested plugin config resolution the faker, orpc, paths and typia plugins each carried into the new `@ir-kit/openapi-ts-plugin-kit` package.
- Updated dependencies [efb6fb5]
  - @ir-kit/openapi-ts-plugin-kit@0.1.0
