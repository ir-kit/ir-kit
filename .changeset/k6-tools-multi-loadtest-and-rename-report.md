---
"@ahmedrowaihi/k6-tools": minor
---

`k6-tools run` now supports multi-loadtest projects: pass `--pattern "loadtests/*.ts"` to run every match in sequence, or declare `loadtests: { browse, write }` in `k6-tools.config.ts` and filter with `--name`. First-class `--out` (comma-separated for multiple sinks) and `--summary` flags replace the four-`--k6-arg` dance. `--continue-on-error` keeps the loop going on failure. `k6-tools sync --scaffold-all` emits one loadtest stub per operation; `--report-renames` diffs operationIds against the previous sync's snapshot and warns on renames/removals.
