# @ahmedrowaihi/k6-toolkit

## 0.2.0

### Minor Changes

- 361d85f: New programmatic library for the k6 workflow. Exports `bundle()` (tsdown passthrough — every option reachable), `runK6()` (bundle + spawn k6 binary), `sync()` (drives `generate` + snapshot/diff), `init()` (one-shot scaffold: generates the typed client + AST-builds a starter `loadtest.ts` parameterized on `auth`/`pace`), plus a re-export of `generate` from `@ahmedrowaihi/k6-gen`. Replaces the deleted `@ahmedrowaihi/k6-tools` CLI — consumers drive the bundle/run/sync flow directly from their scripts. Bundler is tsdown.

### Patch Changes

- Updated dependencies [361d85f]
- Updated dependencies [361d85f]
  - @ahmedrowaihi/k6-gen@0.2.2
  - @ahmedrowaihi/openapi-tools@1.4.0
