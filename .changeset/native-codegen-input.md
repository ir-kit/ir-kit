---
"@ir-kit/openapi-tools": minor
"@ir-kit/openapi-go": patch
"@ir-kit/openapi-kotlin": patch
"@ir-kit/openapi-swift": patch
"@ir-kit/openapi-java": patch
---

Add `parseForCodegen` to `@ir-kit/openapi-tools/parse`, returning the IR with each operation's security scheme names, so the native generators stop pairing `parseSpec` and `extractSecuritySchemeNames` by hand.
