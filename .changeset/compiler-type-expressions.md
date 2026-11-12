---
"@ir-kit/compiler-go": minor
"@ir-kit/compiler-swift": minor
"@ir-kit/openapi-go": patch
"@ir-kit/openapi-swift": patch
---

Add `createTypeExpression` to the Go and Swift compilers and `createImplicitMemberExpression` to Swift, so generators place types in expression position without casting type nodes or printing them into identifier text.
