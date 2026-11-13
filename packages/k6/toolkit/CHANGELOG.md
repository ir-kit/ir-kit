# @ir-kit/k6-toolkit

## 0.2.3

### Patch Changes

- c8bb71b: - `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
  - `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
  - `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
  - k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.
- Updated dependencies [c8bb71b]
  - @ir-kit/k6-gen@0.4.1

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
