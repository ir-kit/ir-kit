# @ir-kit/asyncapi-typescript

## 2.0.1

### Patch Changes

- c8bb71b: - `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
  - `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
  - `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
  - k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.

## 2.0.0

### Major Changes

- 002b3e6: Generate `types.gen.ts` with `@hey-api/openapi-ts` instead of `@asyncapi/modelina`. Component schemas keep their spec names and `allOf` stays an intersection, instead of Modelina's invented names like `OneOf_0AllOf_1Subscription`. Free-form objects become `{ [key: string]: unknown }` instead of `Map<string, any>`, enums become string-literal unions, and schema descriptions carry over as doc comments. The output now passes `isolatedModules` / `verbatimModuleSyntax`. Breaking: declarations are `type` aliases instead of `interface`/`enum`, nested anonymous objects are inlined, and the peer dependency `@asyncapi/modelina` is replaced by `@hey-api/openapi-ts >=0.99.0`. The `event-map` plugin's `messageSuffix` option, already ignored, is removed; set it on the `typescript` plugin.

### Minor Changes

- 1c180ae: - `event-map.gen.ts` imports the interface name the `typescript` plugin actually generated, so camelCase message ids such as `turnOn` no longer produce imports of nonexistent `turnOnMessage` types.
  - Messages without a payload map to `unknown` in `EventMap` instead of importing a type that was never generated.
  - The `typescript` plugin exposes `messageTypeName(messageId)` through `getApi("typescript")`, and the event-map `messageSuffix` option is deprecated and ignored.
  - The `typescript` plugin generates interfaces for multi-format payloads such as Avro instead of `any`, and escapes string enum values like `"\r\n"`.

### Patch Changes

- 236f15d: Support `@hey-api/openapi-ts` 0.99, `@hey-api/shared` 0.5 and `@hey-api/codegen-core` 0.9, which the peer ranges now require.
  - External imports (`@orpc/*`, `@faker-js/faker`, `typia`, `@standard-schema/spec`) are declared through the plugin `imports` API instead of `plugin.external()`.
  - `defineConfig()` resolves user options against the defaults, so a partial nested object such as `server: { handlers: { mode: "faker" } }` keeps the defaults for the keys it leaves out.
  - The typia plugin finds `@hey-api/typescript` types again; under 0.99 it generated nothing.
  - The oRPC WebSocket and MessagePort clients import `RPCLink` instead of the nonexistent `RPCLinkWebSocket` and `RPCLinkMessagePort` exports.
  - The orpc, paths and typia packages load under plain Node ESM, since their compiled relative imports now carry `.js` extensions.

- 41c770f: `TsStatementNode` and `RawTextNode` now share one `ValueNode` base instead of two copies of the codegen-core node boilerplate.
- Updated dependencies [1c180ae]
- Updated dependencies [41c770f]
  - @ir-kit/asyncapi-core@0.2.0
  - @ir-kit/codegen-core@0.3.0
  - @ir-kit/asyncapi-loader@0.2.1

## 1.0.0

### Patch Changes

- Updated dependencies [86fa954]
  - @ir-kit/codegen-core@0.2.0

## 0.2.0

### Minor Changes

- 61c113a: Extract spec loading into format-specific packages and add TypeSpec input support across all OpenAPI generators.
  - New `@ir-kit/typespec-loader`: compiles a `.tsp` entry point (file path or in-memory source) to an OpenAPI 3 document via `@typespec/compiler` + `@typespec/openapi3`. Programmatic API primary; CLI bin `typespec-to-openapi` wraps it.
  - New `@ir-kit/openapi-loader`: `loadOpenAPI({ input, normalize })` — `$RefParser` bundle + optional hey-api-aware normalize. Moved out of `@ir-kit/openapi-tools`.
  - New `@ir-kit/asyncapi-loader`: `loadAsyncAPI({ input })` — wraps `@ir-kit/asyncapi-core`'s `parseSpecOrThrow` with path/URL dispatch. Replaces the inline loader in `@ir-kit/asyncapi-typescript`.
  - New `@ir-kit/spec-loader`: universal entry point — detects format by extension + content sniff, dispatches to the matching format-loader, returns a discriminated `{ kind, document }`.
  - `@ir-kit/openapi-tools` drops the `loadSpec` re-export (pre-1.0 clean break); consumers import from `@ir-kit/openapi-loader` directly.
  - All 5 OpenAPI generators (`-go`, `-kotlin`, `-swift`, `-typescript`, `@ir-kit/k6-gen`) and `@ir-kit/asyncapi-typescript` updated to use the new loaders.

### Patch Changes

- Updated dependencies [61c113a]
  - @ir-kit/asyncapi-loader@0.2.0
