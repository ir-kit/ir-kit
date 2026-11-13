# @ir-kit/spec-loader

## 0.3.1

### Patch Changes

- @ir-kit/openapi-loader@0.4.1

## 0.3.0

### Minor Changes

- c9bd617: - Spec detection parses the document and reads its root `openapi`, `swagger` or `asyncapi` field instead of regex-scanning the first 2 KB, and rejects files that are none of these instead of treating them as OpenAPI.
  - `spec-loader` exports `classifySpecDocument()` and `readSpecDocument()`, and `openapi-loader` exports `readSpecDocument()`.
  - `convertSpec` detects Postman collections by content rather than only by the `.postman_collection.json` file name.
  - `convertSpec` no longer routes OpenAPI to proto through generated TypeSpec, which always failed to compile, and reports that no converter path exists instead.

### Patch Changes

- Updated dependencies [700a292]
- Updated dependencies [c9bd617]
- Updated dependencies [41c770f]
  - @ir-kit/openapi-loader@0.4.0
  - @ir-kit/typespec-loader@0.2.1
  - @ir-kit/asyncapi-loader@0.2.1

## 0.2.1

### Patch Changes

- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
  - @ir-kit/openapi-loader@0.3.0

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

- Updated dependencies [be5f9e6]
- Updated dependencies [61c113a]
- Updated dependencies [66bcb7f]
  - @ir-kit/typespec-loader@0.2.0
  - @ir-kit/openapi-loader@0.2.0
  - @ir-kit/asyncapi-loader@0.2.0
