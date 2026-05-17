# @ahmedrowaihi/k6-toolkit

## 0.3.0

### Minor Changes

- b17e354: Pass-through bump for `@ahmedrowaihi/k6` v2 + `@ahmedrowaihi/k6-gen` v2 — no API changes here, just propagating the new generated output (async namespace per op, widened CallOpts, runtime bridges) and the new framework shape (`scenario:` field name, async flow, `Ctx`, `flow.batch/group/check/sleep`, custom metrics, digest/ntlm).

### Patch Changes

- Updated dependencies [b17e354]
  - @ahmedrowaihi/k6-gen@1.0.0

## 0.2.1

### Patch Changes

- Updated dependencies [008fdf4]
  - @ahmedrowaihi/k6-gen@0.2.3

## 0.2.0

### Minor Changes

- 361d85f: New programmatic library for the k6 workflow. Exports `bundle()` (tsdown passthrough — every option reachable), `runK6()` (bundle + spawn k6 binary), `sync()` (drives `generate` + snapshot/diff), `init()` (one-shot scaffold: generates the typed client + AST-builds a starter `loadtest.ts` parameterized on `auth`/`pace`), plus a re-export of `generate` from `@ahmedrowaihi/k6-gen`. Replaces the deleted `@ahmedrowaihi/k6-tools` CLI — consumers drive the bundle/run/sync flow directly from their scripts. Bundler is tsdown.

### Patch Changes

- Updated dependencies [361d85f]
- Updated dependencies [361d85f]
  - @ahmedrowaihi/k6-gen@0.2.2
  - @ahmedrowaihi/openapi-tools@1.4.0
