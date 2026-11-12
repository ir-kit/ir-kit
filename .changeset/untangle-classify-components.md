---
"@ir-kit/openapi": minor
"@ir-kit/openapi-go": patch
"@ir-kit/openapi-java": patch
"@ir-kit/openapi-kotlin": patch
"@ir-kit/openapi-swift": patch
---

`@ir-kit/openapi` exports `classifyComponents`, which claims component type names and decides whether each component is a ref, enum, struct, map or plain alias, and the Go, Java, Kotlin and Swift generators build their declarations from it instead of each repeating that logic.
