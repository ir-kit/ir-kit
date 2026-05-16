# @ahmedrowaihi/k6-tools

## 0.2.0

### Minor Changes

- cecb5ba: `k6-tools run` now supports multi-loadtest projects: pass `--pattern "loadtests/*.ts"` to run every match in sequence, or declare `loadtests: { browse, write }` in `k6-tools.config.ts` and filter with `--name`. First-class `--out` (comma-separated for multiple sinks) and `--summary` flags replace the four-`--k6-arg` dance. `--continue-on-error` keeps the loop going on failure. `k6-tools sync --scaffold-all` emits one loadtest stub per operation; `--report-renames` diffs operationIds against the previous sync's snapshot and warns on renames/removals.

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
