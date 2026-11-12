# @ir-kit/openapi-go

## 2.1.0

### Minor Changes

- 376e65c: The plain-data Go DSL (`go-dsl/`) and the DSL→AST lowering are gone: emitters now build `@ir-kit/compiler-go` nodes directly through thin builders in `src/ast` (`goStruct`, `goFuncDecl`, `goCall`, …). `GoDecl` is now `{ kind, name, file?, receiver?, node }`, `goField` tags are passed without backticks, and `goFile` / `printFile` come from the printer module. Generated output is unchanged.
- 2d0d1f8: The Go SDK runtime (`api_client.go`, `auth.go`, `request_options.go`, …) now ships as real Go sources under `runtime/` and is copied into each generated SDK with only the package clause rewritten, instead of living as TypeScript template strings. The auth runtime is always included (no more spliced-in `Auth` field); `RuntimeOpts.hasAuth` and `apiClientGo` are removed.

### Patch Changes

- f869f1e: Generated Go is now printed by `@ir-kit/compiler-go` instead of the hand-written string printer: struct fields and const blocks are column-aligned, imports are grouped goimports-style, and every emitted file (runtime included) passes `gofmt` / `goimports`.
- f869f1e: Generated Go now passes `go vet` on Stripe, Slack, Box, OpenAI and Mux: parameters can no longer shadow method-body locals or imported packages (`path`, `url`, `body`), multi-2xx methods return the response interface instead of a pointer to it, decode errors assign the named `err` result instead of shadowing it, form bodies use `url.Values{}`, and optional slice/map parameters are no longer dereferenced.
- f869f1e: `loadOpenAPI` now gives every schema that is `$ref`'d from outside the components section (e.g. `#/paths/~1apps/get/.../properties/cors`) a home in `components.schemas` and rewrites those refs, so generators only ever see refs to declared components (`hoistForeignSchemaRefs`). Go names that would start with a digit are now `X`-prefixed so they stay exported, and struct fields that normalize to the same name are disambiguated.
- 86fa954: Type names now resolve through a per-run `Namespace` keyed by semantic identity: component schemas, `$ref`s and synthesized inline types always agree on spelling, invalid source names (`properties-store`) become valid identifiers, and clashes get deterministic suffixes instead of duplicate declarations. Enum classification is total — boolean, number and mixed enums degrade to their value type instead of throwing, and clashing entry names are disambiguated. `assertNoEnumCollisions` is replaced by `uniqueEnumEntries`.
- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
- Updated dependencies [86fa954]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/compiler-go@0.0.1
  - @ir-kit/openapi@0.4.0
  - @ir-kit/codegen-core@0.2.0
  - @ir-kit/openapi-tools@0.3.1

## 2.0.0

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

## 1.0.0

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
