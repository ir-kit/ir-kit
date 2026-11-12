---
"@ir-kit/codegen-core": minor
"@ir-kit/openapi-go": patch
"@ir-kit/openapi-java": patch
"@ir-kit/openapi-kotlin": patch
"@ir-kit/openapi-swift": patch
---

`codegen-core` exports `writeOutput(out, files, { clean })`, and the Go, Java, Kotlin and Swift generators write their output through it instead of each repeating the clean-and-write loop.
