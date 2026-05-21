# @ir-kit/typespec-loader

## 0.2.0

### Minor Changes

- be5f9e6: Consolidate scattered CLIs into the unified `ir` binary.
  - `ir recon <har>` — HAR → OpenAPI 3.1 reverse-engineering; replaces the standalone `openapi-recon` binary.
  - The `typespec-to-openapi` binary is removed; covered by `ir spec convert <main.tsp> --to openapi3`.
  - `@ir-kit/openapi-recon` and `@ir-kit/typespec-loader` no longer ship their own `bin` entries; they remain importable libraries.

  `@ir-kit/fn-schema-cli` and the `@ir-kit/k6-toolkit` CLI utilities are unchanged for now; they'll get their own migration commits since each has multiple subcommands worth porting carefully.

- 61c113a: Extract spec loading into format-specific packages and add TypeSpec input support across all OpenAPI generators.
  - New `@ir-kit/typespec-loader`: compiles a `.tsp` entry point (file path or in-memory source) to an OpenAPI 3 document via `@typespec/compiler` + `@typespec/openapi3`. Programmatic API primary; CLI bin `typespec-to-openapi` wraps it.
  - New `@ir-kit/openapi-loader`: `loadOpenAPI({ input, normalize })` — `$RefParser` bundle + optional hey-api-aware normalize. Moved out of `@ir-kit/openapi-tools`.
  - New `@ir-kit/asyncapi-loader`: `loadAsyncAPI({ input })` — wraps `@ir-kit/asyncapi-core`'s `parseSpecOrThrow` with path/URL dispatch. Replaces the inline loader in `@ir-kit/asyncapi-typescript`.
  - New `@ir-kit/spec-loader`: universal entry point — detects format by extension + content sniff, dispatches to the matching format-loader, returns a discriminated `{ kind, document }`.
  - `@ir-kit/openapi-tools` drops the `loadSpec` re-export (pre-1.0 clean break); consumers import from `@ir-kit/openapi-loader` directly.
  - All 5 OpenAPI generators (`-go`, `-kotlin`, `-swift`, `-typescript`, `@ir-kit/k6-gen`) and `@ir-kit/asyncapi-typescript` updated to use the new loaders.

- 66bcb7f: TypeSpec → JSON Schema and TypeSpec → Proto conversion via in-memory writeFile capture.
  - New `compileTypespecCapture()` in `@ir-kit/typespec-loader`: wraps `NodeHost` with a `CompilerHost` that intercepts `writeFile` calls, runs an arbitrary TypeSpec emitter (e.g. `@typespec/json-schema`, `@typespec/protobuf`), and returns the emitted files keyed by relative path. No disk artifacts.
  - `@ir-kit/spec-convert` registers two new pairs: `typespec → json-schema` and `typespec → proto`. `@typespec/json-schema` and `@typespec/protobuf` are optional peer deps on `@ir-kit/typespec-loader` and `@ir-kit/spec-convert` — install them only if you need those targets.
  - `ConvertOutput` gains a third variant: `{ kind: "files", files: Record<string, string> }` for multi-file targets. `ir spec convert` writes them to a directory when `--out <dir>` is passed.
