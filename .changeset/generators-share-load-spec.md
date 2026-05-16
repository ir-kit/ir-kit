---
"@ahmedrowaihi/openapi-go": patch
"@ahmedrowaihi/openapi-kotlin": patch
"@ahmedrowaihi/openapi-swift": patch
"@ahmedrowaihi/openapi-typescript": patch
"@ahmedrowaihi/k6-gen": patch
---

Replace the per-package `$RefParser.bundle()` + `normalizeSpec()` boilerplate with a single `loadSpec()` call from `@ahmedrowaihi/openapi-tools`. URL inputs that previously got mangled when relative-resolved now pass through. Dropped the now-unused direct dep on `@hey-api/json-schema-ref-parser` from go/kotlin/swift/k6-gen — openapi-tools owns it transitively.
