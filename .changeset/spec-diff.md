---
"@ir-kit/spec-diff": minor
"@ir-kit/cli": minor
---

New `@ir-kit/spec-diff` package — cross-family API spec diff. Normalizes both inputs to OpenAPI 3 via `@ir-kit/spec-convert`, then classifies changes via `api-smart-diff` (breaking / non-breaking / annotation / unclassified / deprecated). New `ir spec diff <before> --after <after> [--failOnBreaking]` command for CI gating.
