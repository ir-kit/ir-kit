# @ir-kit/cli

## 0.2.0

### Minor Changes

- 9c6b081: Two new packages establishing the unified API-toolkit surface.
  - `@ir-kit/spec-convert`: convert between API spec formats (OpenAPI 3, AsyncAPI 3, TypeSpec, Protobuf, JSON Schema). Pair-handler registry; programmatic `convertSpec({ input, to, from? })` API. Seeded with `typespec → openapi3` and `openapi3 → json-schema`.
  - `@ir-kit/cli`: single `ir` binary with a noun-verb command tree (gcloud / kubectl / aws-cli style). Each command is JSON-Schema-defined; the runtime auto-derives citty flags, `@clack/prompts` interactive prompts, help text, and validation from the schema. First command shipped: `ir spec convert`.

- f1fefb5: Consolidate fn-schema into the unified `ir` CLI. `@ir-kit/fn-schema-cli` is deleted; orchestration moved into `@ir-kit/fn-schema-core` as programmatic `runExtract()` / `runScan()` / `runInspect()` / `runDiff()`. New `ir fn-schema {extract,scan,inspect,diff}` commands wrap them.
- be5f9e6: Consolidate scattered CLIs into the unified `ir` binary.
  - `ir recon <har>` — HAR → OpenAPI 3.1 reverse-engineering; replaces the standalone `openapi-recon` binary.
  - The `typespec-to-openapi` binary is removed; covered by `ir spec convert <main.tsp> --to openapi3`.
  - `@ir-kit/openapi-recon` and `@ir-kit/typespec-loader` no longer ship their own `bin` entries; they remain importable libraries.

  `@ir-kit/fn-schema-cli` and the `@ir-kit/k6-toolkit` CLI utilities are unchanged for now; they'll get their own migration commits since each has multiple subcommands worth porting carefully.

- ed1a86c: `ir sdk <target>` commands — SDK generation for every target through one binary.
  - `ir sdk go|kotlin|swift|typescript|k6` — schema-driven flags, each wraps the matching `@ir-kit/openapi-*` `generate()`.
  - `ir sdk all --targets go,kotlin,...` — multi-target dispatch; one input, parallel outputs under `<output>/<target>/`.
  - All `sdk` commands route input through `@ir-kit/spec-loader`, so `.tsp` files compile-on-the-fly via `@ir-kit/typespec-loader`. URL / file path / pre-parsed object all accepted.
  - `@ir-kit/openapi-typescript`: widened `input` type to accept pre-parsed objects (matches the other emitters' shape).

- f1fefb5: Consolidate k6 tooling into the unified `ir` CLI. `@ir-kit/k6-toolkit` drops the `k6-ts` bin; the scaffold wizard / sync / bundle commands now live under `ir k6 {sync,bundle}` as schema-driven wrappers around the toolkit's programmatic API.
- cad443d: Bidirectional TypeSpec ↔ OpenAPI 3 conversion.
  - New converter: `openapi3 → typespec` via `@typespec/openapi3`'s `convertOpenAPI3Document()` programmatic API. Returns TypeSpec source as a string.
  - `ConvertOutput` is now a discriminated union: `{ kind: "document", document }` or `{ kind: "source", source, ext }`. Lets converters return either parsed objects (for JSON-based targets) or raw source (for TypeSpec, Proto, etc.).
  - `ir spec convert` updated to pipe source output verbatim (no JSON serialization for `.tsp` / `.proto` targets).

- f1fefb5: New `@ir-kit/spec-diff` package — cross-family API spec diff. Normalizes both inputs to OpenAPI 3 via `@ir-kit/spec-convert`, then classifies changes via `api-smart-diff` (breaking / non-breaking / annotation / unclassified / deprecated). New `ir spec diff <before> --after <after> [--failOnBreaking]` command for CI gating.
- f1fefb5: New `@ir-kit/spec-docs` package — render any supported spec format as standalone HTML via Scalar API Reference. Delegates HTML emission to `@scalar/core/libs/html-rendering` (the same renderer the official Express/Hono/Fastify integrations use). New `ir docs <spec> [--theme] --out docs.html` command.
- 66bcb7f: TypeSpec → JSON Schema and TypeSpec → Proto conversion via in-memory writeFile capture.
  - New `compileTypespecCapture()` in `@ir-kit/typespec-loader`: wraps `NodeHost` with a `CompilerHost` that intercepts `writeFile` calls, runs an arbitrary TypeSpec emitter (e.g. `@typespec/json-schema`, `@typespec/protobuf`), and returns the emitted files keyed by relative path. No disk artifacts.
  - `@ir-kit/spec-convert` registers two new pairs: `typespec → json-schema` and `typespec → proto`. `@typespec/json-schema` and `@typespec/protobuf` are optional peer deps on `@ir-kit/typespec-loader` and `@ir-kit/spec-convert` — install them only if you need those targets.
  - `ConvertOutput` gains a third variant: `{ kind: "files", files: Record<string, string> }` for multi-file targets. `ir spec convert` writes them to a directory when `--out <dir>` is passed.

### Patch Changes

- Updated dependencies [9c6b081]
- Updated dependencies [f1fefb5]
- Updated dependencies [be5f9e6]
- Updated dependencies [ed1a86c]
- Updated dependencies [f1fefb5]
- Updated dependencies [cad443d]
- Updated dependencies [f1fefb5]
- Updated dependencies [f1fefb5]
- Updated dependencies [f1fefb5]
- Updated dependencies [61c113a]
- Updated dependencies [66bcb7f]
  - @ir-kit/spec-convert@0.2.0
  - @ir-kit/fn-schema-core@0.2.0
  - @ir-kit/openapi-recon@0.2.0
  - @ir-kit/openapi-typescript@0.2.0
  - @ir-kit/k6-toolkit@0.2.0
  - @ir-kit/spec-diff@0.2.0
  - @ir-kit/spec-docs@0.2.0
  - @ir-kit/spec-loader@0.2.0
  - @ir-kit/openapi-go@2.0.0
  - @ir-kit/openapi-kotlin@2.0.0
  - @ir-kit/openapi-swift@2.0.0
  - @ir-kit/k6-gen@0.3.0
  - @ir-kit/fn-schema-typescript@0.1.1
