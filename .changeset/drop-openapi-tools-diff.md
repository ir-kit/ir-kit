---
"ir-kit": minor
---

Removed `diffSpecs` and `parseSpec` from `ir-kit/openapi-tools`, along with the `ir-kit/openapi-tools/diff` and `ir-kit/openapi-tools/parse` subpaths. The package had two functions named `diffSpecs`. Use `ir spec diff` or `diffSpecs` from `ir-kit/spec` to compare specs, and `parseOpenAPI` from `ir-kit/ir` to parse one.
