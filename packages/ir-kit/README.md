# ir-kit

One package for working with API specs. Load, convert, diff and document OpenAPI, AsyncAPI, TypeSpec, protobuf and Postman specs, and generate SDKs, Hey API plugin output and k6 load tests from them.

```sh
npm i -D @ir-kit/kit
npx ir sdk go openapi.yaml --output sdk/go
```

## Subpaths

| Import | What it does | Docs |
| --- | --- | --- |
| `@ir-kit/kit` / `@ir-kit/kit/spec` | `loadSpec`, `convertSpec`, `diffSpec`, `renderDocs` | [load](./docs/spec-load.md), [convert](./docs/spec-convert.md), [diff](./docs/spec-diff.md), [docs](./docs/spec-docs.md) |
| `@ir-kit/kit/spec/openapi`, `/asyncapi`, `/typespec` | format-specific loaders | [openapi](./docs/spec-openapi.md), [asyncapi](./docs/spec-asyncapi.md), [typespec](./docs/spec-typespec.md) |
| `@ir-kit/kit/sdk/go`, `/java`, `/kotlin`, `/swift`, `/typescript` | SDK generators, each with `generate({ spec, output })` | [go](./docs/sdk-go.md), [java](./docs/sdk-java.md), [kotlin](./docs/sdk-kotlin.md), [swift](./docs/sdk-swift.md), [typescript](./docs/sdk-typescript.md) |
| `@ir-kit/kit/sdk/k6` | typed k6 client generator | [k6](./docs/sdk-k6.md) |
| `@ir-kit/kit/sdk/asyncapi` | TypeScript output for AsyncAPI specs | [asyncapi](./docs/sdk-asyncapi.md) |
| `@ir-kit/kit/openapi-ts/faker`, `/orpc`, `/paths`, `/typia`, `/k6` | Hey API plugins | [faker](./docs/openapi-ts-faker.md), [orpc](./docs/openapi-ts-orpc.md), [paths](./docs/openapi-ts-paths.md), [typia](./docs/openapi-ts-typia.md), [k6](./docs/openapi-ts-k6.md) |
| `@ir-kit/kit/fn-schema` | JSON Schema from TypeScript function signatures | [fn-schema](./docs/fn-schema-core.md) |
| `@ir-kit/kit/fn-schema/unplugin/vite` (and `/webpack`, `/rollup`, ...) | fn-schema bundler plugins | [unplugin](./docs/fn-schema-unplugin.md) |
| `@ir-kit/kit/recon` | build an OpenAPI spec from recorded traffic | [recon](./docs/recon.md) |
| `@ir-kit/kit/k6-toolkit` | k6 project scaffold, sync and bundle | [k6-toolkit](./docs/k6-toolkit.md) |
| `@ir-kit/kit/cli` | the `ir` command's specs, to embed it in your own tooling | [cli](./docs/cli.md) |

## Optional dependencies

Only install what the features you use need:

| Feature | Install |
| --- | --- |
| TypeSpec input | `@typespec/compiler @typespec/openapi3` (plus `@typespec/json-schema` / `@typespec/protobuf` for those outputs) |
| AsyncAPI input | `@asyncapi/parser` |
| Postman conversion | `openapi-to-postmanv2` / `@readme/postman-to-openapi` |
| fn-schema | `ts-morph ts-json-schema-generator` (and `unplugin` for the bundler plugins) |
| Hey API plugins | the plugin's own peers, such as `@faker-js/faker`, `@orpc/*` or `typia` |

The runtime that k6 scripts import stays in its own package, [`@ir-kit/k6`](../k6/framework).
