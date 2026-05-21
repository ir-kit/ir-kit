# @ir-kit/spec-diff

## 0.2.0

### Minor Changes

- f1fefb5: New `@ir-kit/spec-diff` package — cross-family API spec diff. Normalizes both inputs to OpenAPI 3 via `@ir-kit/spec-convert`, then classifies changes via `api-smart-diff` (breaking / non-breaking / annotation / unclassified / deprecated). New `ir spec diff <before> --after <after> [--failOnBreaking]` command for CI gating.

### Patch Changes

- Updated dependencies [9c6b081]
- Updated dependencies [cad443d]
- Updated dependencies [f1fefb5]
- Updated dependencies [66bcb7f]
  - @ir-kit/spec-convert@0.2.0
