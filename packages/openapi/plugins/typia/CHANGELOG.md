# @ir-kit/openapi-ts-typia

## 2.1.0

### Minor Changes

- a2f85a6: Support typia 15. The peer range is now `^12.0.0 || ^15.0.0`, and the tag list knows typia 15's new `Exclude` and `Probability` tags. The docs now set up typia's compiler transform with `ttsc` and `@ttsc/unplugin` instead of `@ryoppippi/unplugin-typia`.

### Patch Changes

- bea1e4d: Validate optional request sections. An operation with an optional `body`, `query` or `headers` (for example `body?: Blob | File`) got `unknown` for that section, so its validator accepted anything. Optional sections now keep their type and also accept `undefined`.

## 2.0.0

### Major Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.
- 253ace2: `typiaTypeTransformer` now emits `tags.Format<'uuid'>` with an `import type { tags } from 'typia'` instead of inline `import("typia").tags.Format<"uuid">` types, and the `typescript` peer dependency is gone.

### Patch Changes

- Updated dependencies [253ace2]
  - @ir-kit/openapi-ts-plugin-kit@0.2.0

## 1.0.1

### Patch Changes

- c8bb71b: - `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
  - `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
  - `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
  - k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.

## 1.0.0

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
