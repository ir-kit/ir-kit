# @ir-kit/k6-gen

Standalone programmatic generator: OpenAPI 3.x spec → typed [k6](https://k6.io) client + TS types + faker-backed data builders. Same shape as `@ir-kit/openapi-swift`, `@ir-kit/openapi-go`, `@ir-kit/openapi-kotlin` — pure `generate({ spec, output })`, no hey-api plugin runner required at the call site.

## Use cases

- The [@ir-kit/k6-tools](../tools) CLI uses this internally for `k6-tools sync` and `k6-tools init`.
- Embedding in your own tooling (MCP servers, internal CLIs, custom generators).
- The [@ir-kit/openapi-ts-k6](../hey-api) hey-api plugin wraps this when you prefer the `openapi-ts.config.ts` workflow.

## Usage

```ts
import { generate } from "@ir-kit/k6-gen";

await generate({
  input: "./openapi.yaml",         // path | URL | parsed spec object
  output: "./src/gen",
  defaultBaseUrl: "https://api.example.com",   // optional override
  normalize: true,                              // safe normalize preset
});
```

Emits four files under `output`:

| File         | Contents                                                                       |
| ------------ | ------------------------------------------------------------------------------ |
| `types.ts`   | One `export type <Name>` per spec schema. Object schemas → type literals; enums → string-literal unions; refs → `TypeReferenceNode`s. |
| `client.ts`  | One `export function <opId>(...)` per spec operation. Path/query/body/headers typed; returns the parsed JSON response (`__parseJson<T>`). Each call tags `{ operation: <opId> }` and reads middleware headers from `@ir-kit/k6/runtime`. |
| `data.ts`    | `data.<TypeName>(overrides?)` builders — `@faker-js/faker` underneath. Format-aware (uuid, email, date-time, …) and refs resolve to nested `data.<X>()` calls so cycles stay lazy. |
| `index.ts`   | Re-exports the above (`* from client`, `* as types from types`, `data`). |

## Shape

Internally:
1. `@hey-api/json-schema-ref-parser` bundles external refs.
2. `@ir-kit/openapi`'s `normalizeSpec` runs (optional, on by default).
3. `@ir-kit/openapi-tools/parse` returns hey-api's normalized IR.
4. Operation + schema walkers emit `ts.factory` AST → printed with `ts.createPrinter`.

That's it — no hey-api plugin runner is loaded, no `$` DSL is touched.

## See also

- [@ir-kit/k6](../framework) — runtime framework consumed by the generated client
- [@ir-kit/k6-tools](../tools) — CLI built on top of this
