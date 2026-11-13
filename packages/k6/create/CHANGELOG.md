# @ir-kit/create-k6

## 0.1.6

### Patch Changes

- c8bb71b: - `npx @ir-kit/cli` and `npm create @ir-kit/k6` crashed on start, because npm installed TypeScript 7, which has no JavaScript compiler API. Both now depend on TypeScript 5, and every package that uses the compiler API declares `typescript >=5.0.0 <7` as a peer (`k6-toolkit`, `openapi-ts-orpc` and `openapi-ts-typia` declared none).
  - `ir --version` prints the installed version instead of `0.1.0`, and CLI errors print one line instead of a stack trace.
  - `ir spec diff` prints change paths as JSON Pointers (`/paths/~1pet/put`) instead of `/paths//pet/put`.
  - k6 clients quote query parameter names that aren't identifiers (`"page[size]"`), and scaffolded loadtests pass required query parameters and enum values instead of `{}` and `""`.
- Updated dependencies [c8bb71b]
  - @ir-kit/k6-toolkit@0.2.3

## 0.1.5

### Patch Changes

- Updated dependencies [41c770f]
  - @ir-kit/k6-toolkit@0.2.2

## 0.1.4

### Patch Changes

- @ir-kit/k6-toolkit@0.2.1

## 0.1.3

### Patch Changes

- Updated dependencies [f1fefb5]
  - @ir-kit/k6-toolkit@0.2.0

## 0.1.2

### Patch Changes

- @ir-kit/k6-toolkit@0.1.2

## 0.1.1

### Patch Changes

- @ir-kit/k6-toolkit@0.1.1
