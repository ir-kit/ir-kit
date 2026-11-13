# @ir-kit/openapi-java

## 2.0.1

### Patch Changes

- Updated dependencies [c218e3b]
  - @ir-kit/codegen-core@0.4.0
  - @ir-kit/openapi@0.6.1
  - @ir-kit/openapi-loader@0.4.2

## 2.0.0

### Major Changes

- 253ace2: Require the `@hey-api/*` `0.0.0-next-20260930190945` snapshot. Hey API's `next` line builds TypeScript with its own compiler instead of the `typescript` package, so generation now works when TypeScript 7 is installed. Install the same snapshot of `@hey-api/openapi-ts`, `@hey-api/shared`, `@hey-api/codegen-core` and `@hey-api/spec-types` alongside these packages.

### Patch Changes

- Updated dependencies [253ace2]
  - @ir-kit/openapi@0.6.0
  - @ir-kit/openapi-tools@0.5.0
  - @ir-kit/openapi-loader@0.4.1

## 1.0.0

### Patch Changes

- 238d15f: Add `parseForCodegen` to `@ir-kit/openapi-tools/parse`, returning the IR with each operation's security scheme names, so the native generators stop pairing `parseSpec` and `extractSecuritySchemeNames` by hand.
- 0aa2094: Export `java.BinaryOperator` and `java.Modifier` so the Java generator's AST helpers take typed operators and modifiers instead of casting strings, and narrow struct declarations by node kind in Swift's value-cycle boxing instead of casting.
- 41c770f: `@ir-kit/openapi` exports `classifyComponents`, which claims component type names and decides whether each component is a ref, enum, struct, map or plain alias, and the Go, Java, Kotlin and Swift generators build their declarations from it instead of each repeating that logic.
- 41c770f: `@ir-kit/openapi` exports `groupOperationsByTag`, and the Go, Java, Kotlin and Swift generators use it instead of each grouping operations by tag themselves.
- 41c770f: `codegen-core` exports `writeOutput(out, files, { clean })`, and the Go, Java, Kotlin and Swift generators write their output through it instead of each repeating the clean-and-write loop.
- Updated dependencies [0aa2094]
- Updated dependencies [238d15f]
- Updated dependencies [700a292]
- Updated dependencies [2a7c7cf]
- Updated dependencies [c9bd617]
- Updated dependencies [0aa2094]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
- Updated dependencies [41c770f]
  - @ir-kit/compiler-java@0.1.1
  - @ir-kit/openapi-tools@0.4.0
  - @ir-kit/openapi-loader@0.4.0
  - @ir-kit/openapi@0.5.0
  - @ir-kit/codegen-core@0.3.0

## 0.1.0

### Minor Changes

- 9e1e727: `compiler-java` supports `permits` on interface declarations and wraps long type headers, generic arguments, enum constants, comments and call chains the way google-java-format does. `openapi-java` emits integer enums as Java enums, returns a `sealed` interface for multi-status operations, and generates code that compiles and is google-java-format clean for large real-world specs (Stripe, OpenAI, Box, DigitalOcean, Slack, Mux).
- 3c8162e: New package: generate Java 17 client SDKs from OpenAPI 3.x. Models are records (string enums carry their wire value via `@JsonValue`), each tag gets a `<Tag>Api` interface with option-less `default` overloads and an `Http<Tag>Api` implementation on `java.net.http.HttpClient` + Jackson. The runtime ships as real `.java` sources. Optional `gradle: true` emits `build.gradle.kts`.

### Patch Changes

- 5591bff: Generated Kotlin is ktlint-clean on large real-world specs (Stripe, OpenAI, Box, DigitalOcean, Slack, Mux).
  - **Breaking for generated Kotlin names:** synthesized types are PascalCase (`FindPetsByStatusParamStatus`, `SubmitJobResponse`) instead of `Owner_Property`. Enum entries that would start with a digit get a `VALUE_` prefix.
  - API files import each referenced model explicitly instead of `models.*`.
  - Multi-2xx sealed class names are claimed through the type namespace, so the impl and the declaration can no longer disagree.
  - Parameter names drop characters Kotlin can't use (`filters[]` → `filters`); type and API names that start with a digit get an `X` prefix (`X1ClickApplicationsApi`) in Kotlin and Java.
  - Object schemas without properties become a plain `class` (a `data class` needs a constructor property).
  - `compiler-kotlin`: a multi-line call on the right of `=` starts on its own line, `when` entries get blank lines when any entry spans lines, and long parameters move annotations onto their own line and then wrap the type.

- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
- Updated dependencies [3c8162e]
- Updated dependencies [bfa139c]
- Updated dependencies [9e1e727]
- Updated dependencies [86fa954]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/compiler-java@0.1.0
  - @ir-kit/openapi@0.4.0
  - @ir-kit/codegen-core@0.2.0
  - @ir-kit/openapi-tools@0.3.1
