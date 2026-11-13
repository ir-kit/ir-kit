# `@ir-kit/kit/spec`

Convert between API specification formats — OpenAPI 3, AsyncAPI 3, TypeSpec, Protobuf, Postman, JSON Schema. Graph-routed dispatcher: registered `(from → to)` converters compose automatically, so any new edge unlocks every other format combinatorially.

Part of [ir-kit](https://github.com/ahmedrowaihi/ir-kit).

## Install

```sh
npm install @ir-kit/kit
```

## Usage

```ts
import { convertSpec } from "@ir-kit/kit/spec";

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

| From     | →   | To                                    |
| -------- | --- | ------------------------------------- |
| openapi3 | →   | json-schema, postman, proto, typespec |
| postman  | →   | openapi3                              |
| proto    | →   | openapi3                              |
| typespec | →   | openapi3, json-schema, proto          |

Any combination not in this table is resolved automatically by chaining edges through the graph — e.g. `postman → typespec` runs `postman → openapi3 → typespec`.

## OpenAPI → proto

`openapi3 → proto` writes one proto3 file. Pass `upstream: { package: "acme.v1" }` to set the package; it defaults to the snake_cased `info.title`.

| OpenAPI                                         | Protobuf                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| component object schema                         | `message`; non-required scalar and enum fields are `optional`                 |
| `allOf` of objects                              | one `message` with the merged properties                                      |
| `oneOf` / `anyOf`                               | `message` with a `oneof variant`                                              |
| string `enum`                                   | `enum` with a `<NAME>_UNSPECIFIED = 0` value first                            |
| integer `enum`                                  | `int32` / `int64`                                                             |
| `array` / `additionalProperties`                | `repeated` / `map<string, T>`; nested ones are boxed in a single-field message |
| `string` + `date-time`, `binary`/`byte`         | `google.protobuf.Timestamp`, `bytes`                                          |
| untyped schema, mixed enum                      | `google.protobuf.Value`                                                       |
| `$ref` to an array, map or scalar component     | the referenced type, inlined (proto has no aliases)                           |
| operation                                       | `rpc` in a `<FirstTag>Service`, commented with its summary and `METHOD /path` |
| parameters + request body                       | `<Rpc>Request` with one field per parameter plus `body`                       |
| 2xx response                                    | the referenced message, or `<Rpc>Response`; several 2xx become a `oneof`     |
| no parameters / no response body                | `google.protobuf.Empty`                                                       |

Property names become snake_case fields with `json_name` set to the original key. HTTP bindings (`google.api.http`), security schemes and error responses are not emitted. The proto JSON mapping of enums and `oneof`s differs from the OpenAPI JSON for the same data. The output uses proto3 `optional`, which needs protoc 3.15+.

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

See [`@ir-kit/kit/cli`](../../cli) for full flags.

## Limitations

- `typespec → proto` only accepts TypeSpec written for `@typespec/protobuf`, so no route passes through it; `openapi3 → proto` uses its own converter.
- AsyncAPI 3 outputs are not yet registered — `asyncapi3` works as a load target via `@ir-kit/kit/spec`, but not yet as a convert target.
