# `@ir-kit/spec-convert`

Convert between API specification formats — OpenAPI 3, AsyncAPI 3, TypeSpec, Protobuf, Postman, JSON Schema. Graph-routed dispatcher: registered `(from → to)` converters compose automatically, so any new edge unlocks every other format combinatorially.

Part of [ir-kit](https://github.com/ir-kit/ir-kit).

## Install

```sh
npm install @ir-kit/spec-convert
```

## Usage

```ts
import { convertSpec } from "@ir-kit/spec-convert";

const result = await convertSpec({
  input: "./petstore.yaml",
  to: "postman",
});

if (result.output.kind === "document") {
  console.log(result.output.document);
}
```

`convertSpec` auto-detects the source format from the file extension and content (override with `from`). When no direct `(from → to)` converter is registered, the dispatcher BFS-routes through intermediate formats — e.g. `proto → openapi3 → postman` works out of the box.

## Registered converters

| From     | →   | To                             |
| -------- | --- | ------------------------------ |
| openapi3 | →   | json-schema, postman, typespec |
| postman  | →   | openapi3                       |
| proto    | →   | openapi3                       |
| typespec | →   | openapi3, json-schema, proto   |

Any combination not in this table is resolved automatically by chaining edges through the graph — e.g. `postman → typespec` runs `postman → openapi3 → typespec`.

## API

| Export                                             | Description                                                   |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `convertSpec(opts)`                                | Detect format, dispatch (or chain), return the converted spec |
| `listConverters()`                                 | Inspect every registered direct edge                          |
| `SpecFormat`, `ConvertOutput`, `ConvertSpecResult` | Public types                                                  |

`ConvertOutput` is a discriminated union over `{ kind: "document" \| "source" \| "files" }` — a parsed JS object for OpenAPI-family targets, a source string for TypeSpec / Protobuf, or a `{ path → content }` map for emitters that produce multi-file output.

## CLI

```sh
ir spec convert ./input.yaml --to openapi3
ir spec convert ./api.proto --to postman
```

See [`@ir-kit/cli`](../../cli) for full flags.

## Limitations

- `openapi3 → proto` (and any `→ proto` chain through TypeSpec) is currently unsupported: the protobuf emitter requires `@field` numbers and `@TypeSpec.Protobuf.package` decorators that don't survive the OpenAPI → TypeSpec hop. Direct `proto → openapi3` works.
- AsyncAPI 3 outputs are not yet registered — `asyncapi3` works as a load target via `@ir-kit/spec-loader`, but not yet as a convert target.
