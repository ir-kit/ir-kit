---
"@ir-kit/k6-gen": minor
"@ir-kit/k6-toolkit": patch
---

`k6-gen` exports its TypeScript AST helpers from `@ir-kit/k6-gen/ast`, and `k6-toolkit` uses them instead of keeping its own copies.
