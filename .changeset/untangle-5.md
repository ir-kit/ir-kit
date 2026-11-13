---
"ir-kit": minor
---

`IR.Schema` from `ir-kit/ir` is now JSON Schema 2020-12, the same type as `Schema` from `ir-kit/schema`. `parseOpenAPI` converts Hey API's schema form once, so generators no longer call `fromHeyApi` themselves. `getEnumLiterals` moved from `ir-kit/openapi-tools` to `ir-kit/schema`, and the unused `isEnumSchema` and `isUnionSchema` were removed.
