---
"@ir-kit/compiler-kotlin": minor
"@ir-kit/openapi-kotlin": minor
"@ir-kit/openapi-java": patch
---

Generated Kotlin is ktlint-clean on large real-world specs (Stripe, OpenAI, Box, DigitalOcean, Slack, Mux).

- **Breaking for generated Kotlin names:** synthesized types are PascalCase (`FindPetsByStatusParamStatus`, `SubmitJobResponse`) instead of `Owner_Property`. Enum entries that would start with a digit get a `VALUE_` prefix.
- API files import each referenced model explicitly instead of `models.*`.
- Multi-2xx sealed class names are claimed through the type namespace, so the impl and the declaration can no longer disagree.
- Parameter names drop characters Kotlin can't use (`filters[]` → `filters`); type and API names that start with a digit get an `X` prefix (`X1ClickApplicationsApi`) in Kotlin and Java.
- Object schemas without properties become a plain `class` (a `data class` needs a constructor property).
- `compiler-kotlin`: a multi-line call on the right of `=` starts on its own line, `when` entries get blank lines when any entry spans lines, and long parameters move annotations onto their own line and then wrap the type.
