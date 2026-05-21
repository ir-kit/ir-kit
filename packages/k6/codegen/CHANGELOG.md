# @ir-kit/k6-gen

## 0.3.0

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
  - @ir-kit/openapi-loader@0.2.0
  - @ir-kit/openapi-tools@0.3.0

## 0.2.0

### Minor Changes

- 64034d0: New package `@ir-kit/schema` — canonical JSON Schema 2020-12 IR shared across OpenAPI and AsyncAPI codegen families. `Schema` type is re-exported from [`json-schema-typed`](https://www.npmjs.com/package/json-schema-typed)'s `JSONSchema.Interface` (2020-12) so the spec surface stays current upstream. Includes codegen-specific classifiers (union/object/enum/primitive) and adapters from hey-api's `IR.SchemaObject` and raw JSON Schema (any draft).

  `@ir-kit/openapi`, `@ir-kit/openapi-{go,kotlin,swift}`, `@ir-kit/openapi-tools`, and `@ir-kit/k6-gen` now consume canonical `Schema` end-to-end. `SchemaToTypeOps.primitiveType`, `classifyReturnShape`, and emitter schema walkers all take canonical `Schema`; hey-api's `IR.SchemaObject` is converted at the spec→IR boundary via `fromHeyApi`. `classifyBody` now returns `{ shape, schema }` (schema pre-converted). Nested schema slots can be boolean schemas per the 2020-12 spec — guard with `isSchemaObject` when reading.

### Patch Changes

- Updated dependencies [64034d0]
  - @ir-kit/openapi@0.3.0
  - @ir-kit/openapi-tools@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [3bf4075]
  - @ir-kit/openapi@0.2.0
  - @ir-kit/openapi-tools@0.1.1
