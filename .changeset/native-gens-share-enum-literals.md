---
"@ahmedrowaihi/openapi-go": patch
"@ahmedrowaihi/openapi-kotlin": patch
"@ahmedrowaihi/openapi-swift": patch
---

Consume `getEnumLiterals` from `@ahmedrowaihi/openapi-tools` instead of inlining the `items[].const` extraction. No behavior change — the helper applies the same filter for `string | number | boolean` values.
