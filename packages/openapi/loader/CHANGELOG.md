# @ir-kit/openapi-loader

## 0.4.0

### Minor Changes

- c9bd617: - Spec detection parses the document and reads its root `openapi`, `swagger` or `asyncapi` field instead of regex-scanning the first 2 KB, and rejects files that are none of these instead of treating them as OpenAPI.
  - `spec-loader` exports `classifySpecDocument()` and `readSpecDocument()`, and `openapi-loader` exports `readSpecDocument()`.
  - `convertSpec` detects Postman collections by content rather than only by the `.postman_collection.json` file name.
  - `convertSpec` no longer routes OpenAPI to proto through generated TypeSpec, which always failed to compile, and reports that no converter path exists instead.

### Patch Changes

- 700a292: Keep unquoted YAML dates (such as Stripe's `api_version` enum) as strings instead of `Date` objects, which code generation dropped. The TypeScript target now loads specs with `@ir-kit/openapi-loader` like the native targets, so relative paths such as `specs/api.yaml` are no longer read as Hey API registry shorthands, external `$ref`s inside `x-` extensions are ignored, and specs that crashed Hey API's own loader (DigitalOcean) generate.
- Updated dependencies [2a7c7cf]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
  - @ir-kit/openapi@0.5.0

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
