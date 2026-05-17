# @ahmedrowaihi/create-k6

## 0.3.0

### Minor Changes

- b17e354: Pass-through bump for `@ahmedrowaihi/k6` v2 + `@ahmedrowaihi/k6-gen` v2 — no API changes here, just propagating the new generated output (async namespace per op, widened CallOpts, runtime bridges) and the new framework shape (`scenario:` field name, async flow, `Ctx`, `flow.batch/group/check/sleep`, custom metrics, digest/ntlm).

### Patch Changes

- Updated dependencies [b17e354]
  - @ahmedrowaihi/k6-toolkit@0.3.0

## 0.2.1

### Patch Changes

- @ahmedrowaihi/k6-toolkit@0.2.1

## 0.2.0

### Minor Changes

- 361d85f: New wizard scaffolder. Run `npm create @ahmedrowaihi/k6` to bootstrap a load-test project from an OpenAPI spec: pick spec path, output dir, auth flavor, optional per-op stubs — the wizard calls `@ahmedrowaihi/k6-toolkit`'s `init()` to emit the typed client and a starter `loadtest.ts`. Built on `@clack/prompts`.

### Patch Changes

- Updated dependencies [361d85f]
  - @ahmedrowaihi/k6-toolkit@0.2.0
