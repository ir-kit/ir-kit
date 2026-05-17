---
"@ahmedrowaihi/k6": minor
---

Cover the full k6 executor surface and fix a threshold-merge footgun.

- `Scenario` and `Stage` types are re-exported from `k6/options`, so all seven k6 executors (`shared-iterations`, `per-vu-iterations`, `constant-arrival-rate`, `ramping-arrival-rate`, `externally-controlled`, plus the two VU variants) are reachable when a preset doesn't fit.
- New `arrivalRate({ rps, duration, preAllocatedVUs })` and `rampingArrivalRate({ stages, preAllocatedVUs })` presets for open-model (throughput-driven) testing.
- `LoadTestConfig` now accepts `handleSummary` for custom end-of-test output (JUnit, custom JSON, etc.) — re-export as `export const handleSummary = lt.handleSummary`.
- `options.thresholds` is union-merged with `budgets` per metric instead of being silently overwritten — custom thresholds on `checks`, `iteration_duration`, custom metrics, or `abortOnFail` now coexist with `budgets`.
- Pace presets carry ASCII timeline diagrams in their JSDoc so the shape is visible from the editor.
- `@types/k6` moved from devDependencies to dependencies so consumers can resolve the re-exported `Scenario` / `Stage` / `Options` types.
