---
"ir-kit": minor
---

The Go, Kotlin, Swift, Java and k6 generators now read ir-kit's own API model from `ir-kit/ir`, where each operation lists its accepted security schemes in `securitySchemes`.

The Go, Kotlin, Swift and Java SDKs now apply a document's top-level `security` to operations that don't set their own, which previously sent no auth.
