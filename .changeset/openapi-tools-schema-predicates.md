---
"@ahmedrowaihi/openapi-tools": minor
---

Add `getEnumLiterals`, `isEnumSchema`, `isUnionSchema` helpers for IR schema introspection. Lets downstream generators share the `items[].const` extraction and the `items && !type` union shape predicate instead of re-implementing them per target language.
