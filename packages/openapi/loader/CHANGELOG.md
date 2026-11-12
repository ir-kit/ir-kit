# @ir-kit/openapi-loader

## 0.3.0

### Minor Changes

- 31e4737: `loadOpenAPI` no longer fetches external `$ref`s inside `x-` vendor extensions. They are opaque data and are kept as `x-$ref`. Specs like Spotify's, whose `x-spotify-policy` points at a file that isn't shipped, now load. The new `detachExtensionRefs` helper is exported.

  Printers match their formatters on very long headers:
  - `compiler-kotlin` moves a return type that doesn't fit onto its own line and starts the expression body on the next line (ktlint `function-signature`).
  - `compiler-java` breaks before `implements` when a record's components still don't fit on the continuation line (google-java-format).
  - `compiler-go` prints an empty function body as `{\n}` once the header reaches 100 columns (gofmt).

### Patch Changes

- f869f1e: `loadOpenAPI` now gives every schema that is `$ref`'d from outside the components section (e.g. `#/paths/~1apps/get/.../properties/cors`) a home in `components.schemas` and rewrites those refs, so generators only ever see refs to declared components (`hoistForeignSchemaRefs`). Go names that would start with a digit are now `X`-prefixed so they stay exported, and struct fields that normalize to the same name are disambiguated.
- Updated dependencies [f869f1e]
- Updated dependencies [86fa954]
  - @ir-kit/openapi@0.4.0

## 0.2.0

### Minor Changes

- 61c113a: Extract spec loading into format-specific packages and add TypeSpec input support across all OpenAPI generators.
  - New `@ir-kit/typespec-loader`: compiles a `.tsp` entry point (file path or in-memory source) to an OpenAPI 3 document via `@typespec/compiler` + `@typespec/openapi3`. Programmatic API primary; CLI bin `typespec-to-openapi` wraps it.
  - New `@ir-kit/openapi-loader`: `loadOpenAPI({ input, normalize })` — `$RefParser` bundle + optional hey-api-aware normalize. Moved out of `@ir-kit/openapi-tools`.
  - New `@ir-kit/asyncapi-loader`: `loadAsyncAPI({ input })` — wraps `@ir-kit/asyncapi-core`'s `parseSpecOrThrow` with path/URL dispatch. Replaces the inline loader in `@ir-kit/asyncapi-typescript`.
  - New `@ir-kit/spec-loader`: universal entry point — detects format by extension + content sniff, dispatches to the matching format-loader, returns a discriminated `{ kind, document }`.
  - `@ir-kit/openapi-tools` drops the `loadSpec` re-export (pre-1.0 clean break); consumers import from `@ir-kit/openapi-loader` directly.
  - All 5 OpenAPI generators (`-go`, `-kotlin`, `-swift`, `-typescript`, `@ir-kit/k6-gen`) and `@ir-kit/asyncapi-typescript` updated to use the new loaders.
