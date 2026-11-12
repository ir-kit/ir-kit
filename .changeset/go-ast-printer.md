---
"@ir-kit/openapi-go": patch
---

Generated Go is now printed by `@ir-kit/compiler-go` instead of the hand-written string printer: struct fields and const blocks are column-aligned, imports are grouped goimports-style, and every emitted file (runtime included) passes `gofmt` / `goimports`.
