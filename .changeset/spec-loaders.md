---
"@ir-kit/typespec-loader": minor
"@ir-kit/openapi-loader": minor
"@ir-kit/asyncapi-loader": minor
"@ir-kit/spec-loader": minor
"@ir-kit/openapi-tools": minor
"@ir-kit/openapi-go": minor
"@ir-kit/openapi-kotlin": minor
"@ir-kit/openapi-swift": minor
"@ir-kit/openapi-typescript": minor
"@ir-kit/k6-gen": minor
"@ir-kit/asyncapi-typescript": minor
---

Extract spec loading into format-specific packages and add TypeSpec input support across all OpenAPI generators.

- New `@ir-kit/typespec-loader`: compiles a `.tsp` entry point (file path or in-memory source) to an OpenAPI 3 document via `@typespec/compiler` + `@typespec/openapi3`. Programmatic API primary; CLI bin `typespec-to-openapi` wraps it.
- New `@ir-kit/openapi-loader`: `loadOpenAPI({ input, normalize })` — `$RefParser` bundle + optional hey-api-aware normalize. Moved out of `@ir-kit/openapi-tools`.
- New `@ir-kit/asyncapi-loader`: `loadAsyncAPI({ input })` — wraps `@ir-kit/asyncapi-core`'s `parseSpecOrThrow` with path/URL dispatch. Replaces the inline loader in `@ir-kit/asyncapi-typescript`.
- New `@ir-kit/spec-loader`: universal entry point — detects format by extension + content sniff, dispatches to the matching format-loader, returns a discriminated `{ kind, document }`.
- `@ir-kit/openapi-tools` drops the `loadSpec` re-export (pre-1.0 clean break); consumers import from `@ir-kit/openapi-loader` directly.
- All 5 OpenAPI generators (`-go`, `-kotlin`, `-swift`, `-typescript`, `@ir-kit/k6-gen`) and `@ir-kit/asyncapi-typescript` updated to use the new loaders.
