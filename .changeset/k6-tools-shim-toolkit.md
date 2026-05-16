---
"@ahmedrowaihi/k6-tools": minor
---

Slimmed to a thin CLI on top of `@ahmedrowaihi/k6-toolkit`. Internal `bundle.ts`, `run/*`, and `sync/*` modules moved to the toolkit. Replaces esbuild with tsdown for bundling. New `bundle?` config field accepts the full tsdown option set (plugins, dts, target, …); `entry` and `outDir` are excluded because the CLI controls those. Drops the previously-exported `bundle` and `run` from the package surface — import them from `@ahmedrowaihi/k6-toolkit` instead.
