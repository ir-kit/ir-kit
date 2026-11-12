# @ir-kit/compiler-kotlin

## 0.1.0

### Minor Changes

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

- 31e4737: `loadOpenAPI` no longer fetches external `$ref`s inside `x-` vendor extensions. They are opaque data and are kept as `x-$ref`. Specs like Spotify's, whose `x-spotify-policy` points at a file that isn't shipped, now load. The new `detachExtensionRefs` helper is exported.

  Printers match their formatters on very long headers:
  - `compiler-kotlin` moves a return type that doesn't fit onto its own line and starts the expression body on the next line (ktlint `function-signature`).
  - `compiler-java` breaks before `implements` when a record's components still don't fit on the continuation line (google-java-format).
  - `compiler-go` prints an empty function body as `{\n}` once the header reaches 100 columns (gofmt).

- cfe6d3e: The plain-data Kotlin DSL (`kt-dsl/`) is gone: the `kt*` builders in `src/ast` now return `@ir-kit/compiler-kotlin` nodes directly, and `KtDecl` is `{ kind, name, runtime?, receiver?, node }`. Imports are collected from the AST (`referencedNames` + `importsFor`) instead of regex-scanning printed source, so string literals and KDoc no longer trigger spurious imports. `ktProp`'s `inPrimary` is removed (data/enum/impl class properties always live in the primary constructor), as are the unused `ktTypeParam`, `ktClassRef`, `ktMapLit`, `ktRange`/`ktUntil` and `ktUnderscore`. `@ir-kit/compiler-kotlin` exports more node types on the `kt` namespace.
