# @ir-kit/spec-convert

## 0.2.0

### Minor Changes

- 9c6b081: Two new packages establishing the unified API-toolkit surface.
  - `@ir-kit/spec-convert`: convert between API spec formats (OpenAPI 3, AsyncAPI 3, TypeSpec, Protobuf, JSON Schema). Pair-handler registry; programmatic `convertSpec({ input, to, from? })` API. Seeded with `typespec → openapi3` and `openapi3 → json-schema`.
  - `@ir-kit/cli`: single `ir` binary with a noun-verb command tree (gcloud / kubectl / aws-cli style). Each command is JSON-Schema-defined; the runtime auto-derives citty flags, `@clack/prompts` interactive prompts, help text, and validation from the schema. First command shipped: `ir spec convert`.

- cad443d: Bidirectional TypeSpec ↔ OpenAPI 3 conversion.
  - New converter: `openapi3 → typespec` via `@typespec/openapi3`'s `convertOpenAPI3Document()` programmatic API. Returns TypeSpec source as a string.
  - `ConvertOutput` is now a discriminated union: `{ kind: "document", document }` or `{ kind: "source", source, ext }`. Lets converters return either parsed objects (for JSON-based targets) or raw source (for TypeSpec, Proto, etc.).
  - `ir spec convert` updated to pipe source output verbatim (no JSON serialization for `.tsp` / `.proto` targets).

- f1fefb5: Three new converters and a graph-routed dispatcher.
  - `proto → openapi3` via pure-JS `protobufjs` (no Go binary).
  - `postman → openapi3` via `@readme/postman-to-openapi`.
  - `openapi3 → postman` via the Postman-official `openapi-to-postmanv2`.
  - `convertSpec` now BFS-routes through registered edges when no direct `(from → to)` pair exists, so `postman → typespec` and `proto → postman` resolve automatically through OpenAPI 3 as the hub.

- 66bcb7f: TypeSpec → JSON Schema and TypeSpec → Proto conversion via in-memory writeFile capture.
  - New `compileTypespecCapture()` in `@ir-kit/typespec-loader`: wraps `NodeHost` with a `CompilerHost` that intercepts `writeFile` calls, runs an arbitrary TypeSpec emitter (e.g. `@typespec/json-schema`, `@typespec/protobuf`), and returns the emitted files keyed by relative path. No disk artifacts.
  - `@ir-kit/spec-convert` registers two new pairs: `typespec → json-schema` and `typespec → proto`. `@typespec/json-schema` and `@typespec/protobuf` are optional peer deps on `@ir-kit/typespec-loader` and `@ir-kit/spec-convert` — install them only if you need those targets.
  - `ConvertOutput` gains a third variant: `{ kind: "files", files: Record<string, string> }` for multi-file targets. `ir spec convert` writes them to a directory when `--out <dir>` is passed.

### Patch Changes

- Updated dependencies [be5f9e6]
- Updated dependencies [61c113a]
- Updated dependencies [66bcb7f]
  - @ir-kit/typespec-loader@0.2.0
  - @ir-kit/spec-loader@0.2.0
