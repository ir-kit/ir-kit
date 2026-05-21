# `@ir-kit/openapi-loader`

Load an OpenAPI 3.x spec from a file path, URL, or pre-parsed object. Bundles `$ref`s via `@hey-api/json-schema-ref-parser` and runs optional hey-api-aware normalization.

Part of [ir-kit](https://github.com/ir-kit/ir-kit). For multi-format input (OpenAPI + AsyncAPI + TypeSpec under one API), reach for [`@ir-kit/spec-loader`](../../shared/spec-loader) instead.

## Install

```sh
npm install @ir-kit/openapi-loader
```

## Usage

```ts
import { loadOpenAPI } from "@ir-kit/openapi-loader";

const spec = await loadOpenAPI({
  input: "./petstore.yaml", // path, URL, or pre-parsed object
  normalize: true, // optional hey-api normalization
});
```

## API

| Export                               | Description                                                  |
| ------------------------------------ | ------------------------------------------------------------ |
| `loadOpenAPI(opts)`                  | Bundle `$ref`s, optionally normalize, return the spec        |
| `resolveOpenAPIInput(input, cwd?)`   | Resolve a string input to an absolute path / URL passthrough |
| `OpenAPIInput`, `LoadOpenAPIOptions` | Public types                                                 |

`normalize: true` applies the safe preset (`SAFE_NORMALIZE` from `@ir-kit/openapi`). Pass a `NormalizeOptions` object to customize.
