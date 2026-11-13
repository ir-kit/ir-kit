---
"ir-kit": minor
---

The Go, Kotlin, Swift, Java and k6 generators now read ir-kit's own API model (`ir-kit/ir`) instead of Hey API's types. Each operation carries `securitySchemes`, the names of the schemes it accepts.

Fixed: an OpenAPI document's top-level `security` was ignored by the Go, Kotlin, Swift and Java SDKs, so operations that relied on it sent no auth. They now apply it, and `security: []` on an operation still turns auth off.
