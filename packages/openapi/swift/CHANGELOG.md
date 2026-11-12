# @ir-kit/openapi-swift

## 2.1.0

### Minor Changes

- 4146a79: `@ir-kit/openapi-swift` now builds `@ir-kit/compiler-swift` nodes directly: the plain-data `sw-dsl/` and the hand-written `sw-compiler` printer are deleted. The `sw*` builders in `src/ast` keep their names but return compiler nodes, and `SwDecl` is `{ kind, name, runtime?, node }`. Output now uses 2-space indentation (swift-format's default) with parameters inline. Unused builders (`swAs`, `swBinOp`, `swEq`, `swNe`, `swClosedRange`, `swDictLit`, `swForceUnwrap`, `swNil`, `swUnderscore`) are removed; `swCoalesce` is added.

  `@ir-kit/compiler-swift`: prints `leadingComments`; separates multi-line members of type bodies with a blank line and prints empty bodies as `{}`; escapes `\n`, `\r` and `\t` in string literals; wraps function and initializer parameters one per line past `maxLineLength` (default 100, matching swift-format); parenthesizes optional function types (`((A) -> B)?`); wraps long call arguments the way swift-format does; supports trailing closures on calls and labelled associated values on enum cases. More node types are exported on the `swift` namespace.

- 746f3ad: Generated Swift SDKs compile with SwiftPM on Linux and are swift-format-canonical on every real spec we test against (Stripe, OpenAI, DigitalOcean, Box, Slack, Spotify, Mux).

  `@ir-kit/openapi-swift`:
  - Files that use `URLSession`/`URLRequest`/`HTTPURLResponse` import `FoundationNetworking` under `#if canImport(FoundationNetworking)`; the import is derived from the declaration's AST.
  - Free-form schema values are a generated `JSONValue` Codable enum instead of `Any`, so models containing them conform to `Codable`.
  - Schemas that recursively contain themselves through stored properties become `final class` instead of `struct`.
  - Swift keywords, leading digits and `self` in property, case and parameter names are escaped or renamed; schemas named after Swift/Foundation or runtime types (`Error`, `Data`, `URL`, `APIClient`, …) get a disambiguated name.
  - `URLEncoding` is emitted whenever an API implementation is.

  `@ir-kit/compiler-swift`:
  - `ConditionalCompilation` blocks and `throws`/`async` on initializers.
  - Line wrapping now matches swift-format for long type headers, stored properties, enum raw values, type aliases, assignments, array literals, nested calls, parameter defaults, function headers and tuple return types.

- 90c89aa: - **Breaking for generated Swift names:** synthesized types are UpperCamelCase (`FindPetsByStatusParamStatus`, `SubmitJobResponse`) instead of `Owner_Property`, matching Swift naming conventions and the Kotlin and Java generators.
  - The multi-2xx response enum name is claimed through the type namespace.
  - Parameter names drop characters Swift can't use (`filters[]` → `filters`), and type and API names that start with a digit get an `X` prefix (`X1ClickApplicationsAPI`). Before, both produced invalid Swift.

### Patch Changes

- 8f6e0f7: `@ir-kit/compiler-swift` wraps call arguments past `maxLineLength` the way swift-format does (break after `(`, pack arguments, close on its own line when they span several lines). `@ir-kit/openapi-swift` output is now swift-format-canonical: access modifiers sit on extension members instead of the extension, `Package.swift` uses 2-space indentation, and the multipart runtime appends `Data(text.utf8)` instead of an `if let` wrapper. CI lints the generated petstore Swift SDK.
- 86fa954: Type names now resolve through a per-run `Namespace` keyed by semantic identity: component schemas, `$ref`s and synthesized inline types always agree on spelling, invalid source names (`properties-store`) become valid identifiers, and clashes get deterministic suffixes instead of duplicate declarations. Enum classification is total — boolean, number and mixed enums degrade to their value type instead of throwing, and clashing entry names are disambiguated. `assertNoEnumCollisions` is replaced by `uniqueEnumEntries`.
- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
- Updated dependencies [4146a79]
- Updated dependencies [8f6e0f7]
- Updated dependencies [746f3ad]
- Updated dependencies [86fa954]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/openapi@0.4.0
  - @ir-kit/compiler-swift@0.1.0
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
