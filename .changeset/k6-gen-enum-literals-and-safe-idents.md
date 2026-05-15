---
"@ahmedrowaihi/k6-gen": patch
---

Fix enum types collapsing to `string | string | string` and invalid identifiers like `0Enum`. Type emitter now dispatches on `schema.const` and `type === "enum"` before the union branch (mirrors the faker side), preserving literal values. Schema-name slots use `safeIdent` from `@ahmedrowaihi/codegen-core`, so hey-api-generated names beginning with a digit become legal TS identifiers. Multi-name type imports wrap onto separate lines.
