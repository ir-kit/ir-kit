# @ir-kit/openapi-ts-k6

## 0.2.1

### Patch Changes

- Updated dependencies [c8bb71b]
  - @ir-kit/k6-gen@0.4.1

## 0.2.0

### Minor Changes

- 236f15d: Support `@hey-api/openapi-ts` 0.99, `@hey-api/shared` 0.5 and `@hey-api/codegen-core` 0.9, which the peer ranges now require.
  - External imports (`@orpc/*`, `@faker-js/faker`, `typia`, `@standard-schema/spec`) are declared through the plugin `imports` API instead of `plugin.external()`.
  - `defineConfig()` resolves user options against the defaults, so a partial nested object such as `server: { handlers: { mode: "faker" } }` keeps the defaults for the keys it leaves out.
  - The typia plugin finds `@hey-api/typescript` types again; under 0.99 it generated nothing.
  - The oRPC WebSocket and MessagePort clients import `RPCLink` instead of the nonexistent `RPCLinkWebSocket` and `RPCLinkMessagePort` exports.
  - The orpc, paths and typia packages load under plain Node ESM, since their compiled relative imports now carry `.js` extensions.

### Patch Changes

- Updated dependencies [41c770f]
  - @ir-kit/k6-gen@0.4.0

## 0.1.4

### Patch Changes

- @ir-kit/k6-gen@0.3.1

## 0.1.3

### Patch Changes

- Updated dependencies [61c113a]
  - @ir-kit/k6-gen@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies [64034d0]
  - @ir-kit/k6-gen@0.2.0

## 0.1.1

### Patch Changes

- @ir-kit/k6-gen@0.1.1
