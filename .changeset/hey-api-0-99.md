---
"@ir-kit/openapi-ts-orpc": minor
"@ir-kit/openapi-ts-faker": minor
"@ir-kit/openapi-ts-typia": minor
"@ir-kit/openapi-ts-paths": minor
"@ir-kit/openapi-ts-k6": minor
"@ir-kit/openapi-typescript": minor
"@ir-kit/asyncapi-typescript": patch
---

Support `@hey-api/openapi-ts` 0.99, `@hey-api/shared` 0.5 and `@hey-api/codegen-core` 0.9, which the peer ranges now require.

- External imports (`@orpc/*`, `@faker-js/faker`, `typia`, `@standard-schema/spec`) are declared through the plugin `imports` API instead of `plugin.external()`.
- `defineConfig()` resolves user options against the defaults, so a partial nested object such as `server: { handlers: { mode: "faker" } }` keeps the defaults for the keys it leaves out.
- The typia plugin finds `@hey-api/typescript` types again; under 0.99 it generated nothing.
- The oRPC WebSocket and MessagePort clients import `RPCLink` instead of the nonexistent `RPCLinkWebSocket` and `RPCLinkMessagePort` exports.
- The orpc, paths and typia packages load under plain Node ESM, since their compiled relative imports now carry `.js` extensions.
