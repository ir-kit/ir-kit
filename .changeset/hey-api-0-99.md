---
"@ir-kit/openapi-ts-orpc": minor
"@ir-kit/openapi-ts-faker": minor
"@ir-kit/openapi-ts-typia": minor
"@ir-kit/openapi-ts-paths": minor
"@ir-kit/openapi-ts-k6": minor
"@ir-kit/openapi-typescript": minor
"@ir-kit/asyncapi-typescript": patch
---

Support `@hey-api/openapi-ts` 0.99 (`@hey-api/shared` 0.5, `@hey-api/codegen-core` 0.9). The peer ranges now require these versions.

- External imports (`@orpc/*`, `@faker-js/faker`, `typia`, `@standard-schema/spec`) are declared through the plugin `imports` API instead of `plugin.external()`.
- Plugin options are resolved with Hey API's declarative config tables. `defineConfig()` resolves user options against the defaults, so a partial nested object (for example `server: { handlers: { mode: "faker" } }` or `naming: { suffix: "Path" }`) keeps the defaults for the keys it leaves out.
- The typia plugin finds `@hey-api/typescript` types again; under 0.99 it generated nothing.
- The oRPC WebSocket and MessagePort clients import `RPCLink` from their modules. They previously imported `RPCLinkWebSocket` and `RPCLinkMessagePort`, which those modules don't export.
