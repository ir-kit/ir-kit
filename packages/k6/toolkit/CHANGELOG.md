# @ir-kit/k6-toolkit

## 0.2.2

### Patch Changes

- 41c770f: `k6-gen` exports its TypeScript AST helpers from `@ir-kit/k6-gen/ast`, and `k6-toolkit` uses them instead of keeping its own copies.
- Updated dependencies [238d15f]
- Updated dependencies [700a292]
- Updated dependencies [c9bd617]
- Updated dependencies [41c770f]
  - @ir-kit/openapi-tools@0.4.0
  - @ir-kit/openapi-loader@0.4.0
  - @ir-kit/k6-gen@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies [31e4737]
- Updated dependencies [f869f1e]
  - @ir-kit/openapi-loader@0.3.0
  - @ir-kit/k6-gen@0.3.1
  - @ir-kit/openapi-tools@0.3.1

## 0.2.0

### Minor Changes

- f1fefb5: Consolidate k6 tooling into the unified `ir` CLI. `@ir-kit/k6-toolkit` drops the `k6-ts` bin; the scaffold wizard / sync / bundle commands now live under `ir k6 {sync,bundle}` as schema-driven wrappers around the toolkit's programmatic API.

### Patch Changes

- Updated dependencies [61c113a]
  - @ir-kit/openapi-loader@0.2.0
  - @ir-kit/openapi-tools@0.3.0
  - @ir-kit/k6-gen@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies [64034d0]
  - @ir-kit/openapi-tools@0.2.0
  - @ir-kit/k6-gen@0.2.0

## 0.1.1

### Patch Changes

- @ir-kit/k6-gen@0.1.1
- @ir-kit/openapi-tools@0.1.1
