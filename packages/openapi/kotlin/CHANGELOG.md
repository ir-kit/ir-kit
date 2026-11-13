# @ir-kit/openapi-kotlin

## 4.0.0

### Major Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.

### Patch Changes

- Updated dependencies [253ace2]
  - @ir-kit/openapi@0.6.0
  - @ir-kit/openapi-tools@0.5.0
  - @ir-kit/openapi-loader@0.4.1

## 3.0.0

### Patch Changes

- efb6fb5: Build multipart and form-urlencoded request bodies through one shared field-body emitter.
- 0aa2094: Print `${name}` instead of `$name` when the following template text would extend the identifier, and make `createNullableType` return an already nullable type unchanged, so generators no longer guard either case themselves.
- 238d15f: Add `parseForCodegen` to `@ir-kit/openapi-tools/parse`, returning the IR with each operation's security scheme names, so the native generators stop pairing `parseSpec` and `extractSecuritySchemeNames` by hand.
- 41c770f: `@ir-kit/openapi` exports `classifyComponents`, which claims component type names and decides whether each component is a ref, enum, struct, map or plain alias, and the Go, Java, Kotlin and Swift generators build their declarations from it instead of each repeating that logic.
- 41c770f: `@ir-kit/openapi` exports `groupOperationsByTag`, and the Go, Java, Kotlin and Swift generators use it instead of each grouping operations by tag themselves.
- 41c770f: `codegen-core` exports `writeOutput(out, files, { clean })`, and the Go, Java, Kotlin and Swift generators write their output through it instead of each repeating the clean-and-write loop.
- Updated dependencies [0aa2094]
- Updated dependencies [238d15f]
- Updated dependencies [700a292]
- Updated dependencies [2a7c7cf]
- Updated dependencies [c9bd617]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
  - @ir-kit/compiler-kotlin@0.1.1
  - @ir-kit/openapi-tools@0.4.0
  - @ir-kit/openapi-loader@0.4.0
  - @ir-kit/openapi@0.5.0
  - @ir-kit/codegen-core@0.3.0

## 2.1.0

### Minor Changes

- cfe6d3e: The plain-data Kotlin DSL (`kt-dsl/`) is gone: the `kt*` builders in `src/ast` now return `@ir-kit/compiler-kotlin` nodes directly, and `KtDecl` is `{ kind, name, runtime?, receiver?, node }`. Imports are collected from the AST (`referencedNames` + `importsFor`) instead of regex-scanning printed source, so string literals and KDoc no longer trigger spurious imports. `ktProp`'s `inPrimary` is removed (data/enum/impl class properties always live in the primary constructor), as are the unused `ktTypeParam`, `ktClassRef`, `ktMapLit`, `ktRange`/`ktUntil` and `ktUnderscore`. `@ir-kit/compiler-kotlin` exports more node types on the `kt` namespace.
- 0a6e8cc: Generated Kotlin SDKs compile with `kotlinc` and the kotlinx.serialization plugin on every real spec we test against (Stripe, OpenAI, DigitalOcean, Box, Slack, Spotify, Mux). CI now compiles the generated petstore SDK.
  - Free-form schema values (`{}`, untyped `additionalProperties`, unresolvable unions) are `JsonElement` instead of `Any`, so models containing them are serializable. Callers that passed arbitrary objects now build a `JsonElement`.
  - `@SerialName` and enum raw values are emitted as Kotlin string literals, so keys containing `$` stay compile-time constants.
  - Serializers are resolved through type aliases (`typealias Window = Window2?` encodes with `Window2.serializer().nullable`, list and map aliases use `ListSerializer`/`MapSerializer`).
  - Schemas named after Kotlin, library or runtime types (`Response`, `Request`, `Result`, `APIClient`, …) get a disambiguated name.
  - Operation parameters that would shadow a local of the generated method body (`options`, `url`, `client`, …) get a `Param` suffix.
  - Requests set their HTTP method once: with the body when the operation has one, otherwise up front with an empty body for `POST`/`PUT`/`PATCH`. Previously every request started as `.method("POST", null)`, which OkHttp rejects at runtime.

- 15a585c: `@ir-kit/openapi-kotlin` now prints through `@ir-kit/compiler-kotlin`; the hand-written `kt-compiler` printer is deleted. Generated SDKs (models, APIs and runtime) are ktlint-canonical, and CI lints the petstore example and the runtime.
  - The runtime (`APIClient.kt`, `Auth.kt`, …) ships as real Kotlin sources under `runtime/` with only the package header rewritten. Auth helpers are always included; `RuntimeOpts.hasAuth`, `hasFormUrlEncoded` and `apiClientKt` are removed.
  - `@ir-kit/compiler-kotlin`: prints `leadingComments`, adds an `indentSize` option, implements `maxLineLength` (default 140, matching ktlint_official) by wrapping call arguments, single-parameter signatures and expression bodies, and separates annotated enum entries with a blank line.

- 5591bff: Generated Kotlin is ktlint-clean on large real-world specs (Stripe, OpenAI, Box, DigitalOcean, Slack, Mux).
  - **Breaking for generated Kotlin names:** synthesized types are PascalCase (`FindPetsByStatusParamStatus`, `SubmitJobResponse`) instead of `Owner_Property`. Enum entries that would start with a digit get a `VALUE_` prefix.
  - API files import each referenced model explicitly instead of `models.*`.
  - Multi-2xx sealed class names are claimed through the type namespace, so the impl and the declaration can no longer disagree.
  - Parameter names drop characters Kotlin can't use (`filters[]` → `filters`); type and API names that start with a digit get an `X` prefix (`X1ClickApplicationsApi`) in Kotlin and Java.
  - Object schemas without properties become a plain `class` (a `data class` needs a constructor property).
  - `compiler-kotlin`: a multi-line call on the right of `=` starts on its own line, `when` entries get blank lines when any entry spans lines, and long parameters move annotations onto their own line and then wrap the type.

### Patch Changes

- 86fa954: Type names now resolve through a per-run `Namespace` keyed by semantic identity: component schemas, `$ref`s and synthesized inline types always agree on spelling, invalid source names (`properties-store`) become valid identifiers, and clashes get deterministic suffixes instead of duplicate declarations. Enum classification is total — boolean, number and mixed enums degrade to their value type instead of throwing, and clashing entry names are disambiguated. `assertNoEnumCollisions` is replaced by `uniqueEnumEntries`.
- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
- Updated dependencies [cfe6d3e]
- Updated dependencies [15a585c]
- Updated dependencies [5591bff]
- Updated dependencies [86fa954]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/compiler-kotlin@0.1.0
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
