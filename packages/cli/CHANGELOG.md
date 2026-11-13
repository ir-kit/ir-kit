# @ir-kit/cli

## 0.3.3

### Patch Changes

- b7b4d52: `ir sdk all` now loads the spec once and gives the loaded document to every target, so `.tsp` input works for the `typescript` and `k6` targets too (they used to get the raw path and fail). All `ir sdk <target>` commands now come from one target table.
- 3b8caa3: Work with TypeScript 7 installed. `@ir-kit/cli` no longer installs TypeScript 5, `@ir-kit/fn-schema-typescript` no longer asks for `typescript <7` (ts-morph and ts-json-schema-generator bring their own compiler), and the oRPC plugin parses handler files with the compiler that ships with ts-morph.
- Updated dependencies [b7b4d52]
- Updated dependencies [3b8caa3]
- Updated dependencies [c218e3b]
  - @ir-kit/fn-schema-core@0.2.2
  - @ir-kit/fn-schema-typescript@0.1.4
  - @ir-kit/openapi-go@4.0.1
  - @ir-kit/openapi-kotlin@4.0.1
  - @ir-kit/openapi-swift@4.0.1
  - @ir-kit/spec-convert@0.4.1
  - @ir-kit/k6-toolkit@0.3.1
  - @ir-kit/openapi-typescript@0.4.1
  - @ir-kit/k6-gen@0.5.1
  - @ir-kit/openapi-java@2.0.1
  - @ir-kit/schema@0.4.1
  - @ir-kit/spec-diff@0.2.4
  - @ir-kit/spec-docs@0.2.4
  - @ir-kit/spec-loader@0.3.2

## 0.3.2

### Patch Changes

- Updated dependencies [253ace2]
- Updated dependencies [253ace2]
  - @ir-kit/openapi-go@4.0.0
  - @ir-kit/openapi-java@2.0.0
  - @ir-kit/openapi-kotlin@4.0.0
  - @ir-kit/openapi-swift@4.0.0
  - @ir-kit/k6-gen@0.5.0
  - @ir-kit/k6-toolkit@0.3.0
  - @ir-kit/openapi-recon@0.4.0
  - @ir-kit/openapi-typescript@0.4.0
  - @ir-kit/schema@0.4.0
  - @ir-kit/spec-convert@0.4.0
  - @ir-kit/spec-diff@0.2.3
  - @ir-kit/spec-docs@0.2.3
  - @ir-kit/spec-loader@0.3.1

## 0.3.1

### Patch Changes

- c8bb71b: - `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
  - `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
  - `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
  - k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.
- Updated dependencies [c8bb71b]
  - @ir-kit/k6-gen@0.4.1
  - @ir-kit/k6-toolkit@0.2.3
  - @ir-kit/fn-schema-typescript@0.1.3

## 0.3.0

### Minor Changes

- c6699da: Add `ir sdk java`, add `java` to `ir sdk all`, and make `ir sdk all` accept TypeSpec input for the native targets like the per-language commands do.

### Patch Changes

- 41c770f: The `sdk go`, `sdk kotlin`, `sdk swift` and `sdk java` commands and `sdk all` now come from one table of native SDK targets, so adding a target is a single entry.
- Updated dependencies [0aa2094]
- Updated dependencies [236f15d]
- Updated dependencies [efb6fb5]
- Updated dependencies [0aa2094]
- Updated dependencies [238d15f]
- Updated dependencies [700a292]
- Updated dependencies [2a7c7cf]
- Updated dependencies [039b040]
- Updated dependencies [c9bd617]
- Updated dependencies [238d15f]
- Updated dependencies [0aa2094]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
  - @ir-kit/openapi-go@3.0.0
  - @ir-kit/openapi-swift@3.0.0
  - @ir-kit/openapi-typescript@0.3.0
  - @ir-kit/openapi-kotlin@3.0.0
  - @ir-kit/openapi-java@1.0.0
  - @ir-kit/spec-convert@0.3.0
  - @ir-kit/openapi-recon@0.3.0
  - @ir-kit/spec-loader@0.3.0
  - @ir-kit/fn-schema-core@0.2.1
  - @ir-kit/k6-gen@0.4.0
  - @ir-kit/k6-toolkit@0.2.2
  - @ir-kit/spec-diff@0.2.2
  - @ir-kit/spec-docs@0.2.2
  - @ir-kit/fn-schema-typescript@0.1.2
  - @ir-kit/schema@0.3.1

## 0.2.1

### Patch Changes

- Updated dependencies [f869f1e]
- Updated dependencies [376e65c]
- Updated dependencies [2d0d1f8]
- Updated dependencies [f869f1e]
- Updated dependencies [f869f1e]
- Updated dependencies [cfe6d3e]
- Updated dependencies [0a6e8cc]
- Updated dependencies [15a585c]
- Updated dependencies [5591bff]
- Updated dependencies [4146a79]
- Updated dependencies [8f6e0f7]
- Updated dependencies [746f3ad]
- Updated dependencies [90c89aa]
- Updated dependencies [86fa954]
  - @ir-kit/openapi-go@2.1.0
  - @ir-kit/openapi-kotlin@2.1.0
  - @ir-kit/openapi-swift@2.1.0
  - @ir-kit/schema@0.3.0
  - @ir-kit/k6-gen@0.3.1
  - @ir-kit/k6-toolkit@0.2.1
  - @ir-kit/openapi-typescript@0.2.1
  - @ir-kit/spec-loader@0.2.1
  - @ir-kit/spec-convert@0.2.1
  - @ir-kit/spec-diff@0.2.1
  - @ir-kit/spec-docs@0.2.1

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
