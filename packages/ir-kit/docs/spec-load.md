# `ir-kit/spec`

Universal spec loader for OpenAPI, AsyncAPI, and TypeSpec. Detects format by extension + content sniff and dispatches to the matching per-format loader, returning a discriminated `{ kind, document }` result.

Part of [ir-kit](https://github.com/ahmedrowaihi/ir-kit).

## Install

```sh
npm install ir-kit
```

## Usage

```ts
import { loadSpec } from "ir-kit/spec";

const result = await loadSpec({ input: "./api.yaml" });
//   result.kind:     "openapi" | "asyncapi"
//   result.document: parsed OpenAPI object or AsyncAPIDocumentInterface
```

TypeSpec input (`.tsp`) compiles to OpenAPI 3 in-memory and returns as `{ kind: "openapi" }`. Pre-parsed objects pass through and are classified by their top-level `asyncapi` / `openapi` / `swagger` key.

## API

| Export                                                       | Description                                     |
| ------------------------------------------------------------ | ----------------------------------------------- |
| `loadSpec(opts)`                                             | Detect + dispatch + return `{ kind, document }` |
| `loadOpenAPI`, `loadAsyncAPI`, `compileTypespec`             | Re-exports from each per-format loader          |
| `resolveOpenAPIInput`, `isTypespecPath`                      | Utility helpers                                 |
| `SpecKind`, `SpecInput`, `LoadSpecOptions`, `LoadSpecResult` | Public types                                    |

Per-format loaders ship as separate packages — `ir-kit/spec/openapi`, `ir-kit/spec/asyncapi`, `ir-kit/spec/typespec` — if you want a smaller dependency footprint and only need one format.

## Why a wrapper

Every consumer in ir-kit (codegen, docs, diff, recon) needs the same input-handling logic: paths vs URLs vs pre-parsed objects, format detection, `$ref` bundling. Centralizing it here removes that boilerplate from every downstream package.
