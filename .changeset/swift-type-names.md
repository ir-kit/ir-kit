---
"@ir-kit/openapi-swift": minor
---

- **Breaking for generated Swift names:** synthesized types are UpperCamelCase (`FindPetsByStatusParamStatus`, `SubmitJobResponse`) instead of `Owner_Property`, matching Swift naming conventions and the Kotlin and Java generators.
- The multi-2xx response enum name is claimed through the type namespace.
- Parameter names drop characters Swift can't use (`filters[]` → `filters`), and type and API names that start with a digit get an `X` prefix (`X1ClickApplicationsAPI`). Before, both produced invalid Swift.
