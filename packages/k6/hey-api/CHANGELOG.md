# @ahmedrowaihi/openapi-ts-k6

## 0.2.3

### Patch Changes

- Updated dependencies [e3eb564]
  - @ahmedrowaihi/k6-gen@1.1.0

## 0.2.2

### Patch Changes

- Updated dependencies [a92f011]
  - @ahmedrowaihi/k6-gen@1.0.2

## 0.2.1

### Patch Changes

- Updated dependencies [b924e63]
  - @ahmedrowaihi/k6-gen@1.0.1

## 0.2.0

### Minor Changes

- b17e354: Pass-through bump for `@ahmedrowaihi/k6` v2 + `@ahmedrowaihi/k6-gen` v2 — no API changes here, just propagating the new generated output (async namespace per op, widened CallOpts, runtime bridges) and the new framework shape (`scenario:` field name, async flow, `Ctx`, `flow.batch/group/check/sleep`, custom metrics, digest/ntlm).

### Patch Changes

- Updated dependencies [b17e354]
  - @ahmedrowaihi/k6-gen@1.0.0

## 0.1.5

### Patch Changes

- Updated dependencies [008fdf4]
  - @ahmedrowaihi/k6-gen@0.2.3

## 0.1.4

### Patch Changes

- Updated dependencies [361d85f]
  - @ahmedrowaihi/k6-gen@0.2.2

## 0.1.3

### Patch Changes

- Updated dependencies [d8b5702]
  - @ahmedrowaihi/k6-gen@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [cecb5ba]
  - @ahmedrowaihi/k6-gen@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [6cb0943]
  - @ahmedrowaihi/k6-gen@0.1.1

## 0.1.0

### Minor Changes

- 6c9e57d: Introduce the k6 load-testing track: a framework (`defineLoadTest`, `flow().step()`, pace presets, budgets, `useAuth` middleware), a standalone generator (`k6-gen.generate`) emitting a typed client + data builders, a CLI (`k6-tools init/sync/run`), and a thin hey-api plugin wrapper.

### Patch Changes

- Updated dependencies [6c9e57d]
  - @ahmedrowaihi/k6-gen@0.1.0
