---
"@ir-kit/openapi": minor
"@ir-kit/openapi-loader": patch
"@ir-kit/openapi-go": patch
---

`loadOpenAPI` now gives every schema that is `$ref`'d from outside the components section (e.g. `#/paths/~1apps/get/.../properties/cors`) a home in `components.schemas` and rewrites those refs, so generators only ever see refs to declared components (`hoistForeignSchemaRefs`). Go names that would start with a digit are now `X`-prefixed so they stay exported, and struct fields that normalize to the same name are disambiguated.
