# @ir-kit/openapi-java

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
