# @ahmedrowaihi/k6

## 1.0.0

### Major Changes

- b17e354: V2 — async + full k6 exec surface + fluent ops + custom metrics + digest/ntlm auth.

  **Renames** (breaking):

  - `pace:` → `scenario:` (both shorthand and inside `scenarios.<name>`) — matches k6's own vocabulary.
  - `StepCtx` → `Ctx`; `ctx.vu` is now an object (`vu.idInTest`, `vu.iterationInScenario`, `vu.tags`, …) covering the full `k6/execution` surface (`scenario`, `instance`, `test`, `env`, `vuState`).
  - `defineLoadTest`'s compiled `default` is now async (`() => Promise<void>`) — k6 awaits per-iteration. Steps may be sync or async; `flow.run()` is async.

  **New fluent ops** on `FlowBuilder`:

  - `.batch("label", (input) => ({ a: ..., b: api.async.thing() }))` — labeled parallel; Promise values awaited via `Promise.all`, sync values pass through. Pair with the new `api.async.*` namespace for true Go-side parallel HTTP.
  - `.group("label", (sub) => sub.step(...))` — wraps a sub-flow in k6's `group()` so every request inside carries the `group:` tag.
  - `.check("label", v => bool)` — soft check; feeds k6's `checks` rate metric.
  - `.sleep(duration)` — typed sleep accepting `"500ms" | 1` etc.

  **New config fields** on `defineLoadTest`:

  - `metrics: { name: "counter" | "gauge" | "rate" | "trend" }` — typed handle backed by `k6/metrics`. Returned as `lt.metrics.<name>.add(value, tags?)`.
  - `perVU: () => VuState` — runs once per VU; threaded into `ctx.vuState`.

  **Auth**:

  - `useAuth.digest({ user, pass })` — k6's `auth: "digest"` (built-in 401-challenge handshake).
  - `useAuth.ntlm({ user, pass })` — k6's `auth: "ntlm"`.

  **Middleware shape widened**: `Middleware` may now contribute `params()` returning a partial `Params` shape (used by digest/ntlm for k6's `auth:` field) in addition to `headers()`.

  **Runtime bridge**: framework requires the generated client (`@ahmedrowaihi/k6-gen` ≥ 1.0) to install runtime bridges (`installK6Bridge`, `setExecModule`, `installMetricsFactory`) at module load. Importing the generated client from `loadtest.ts` is now the wiring point.

  Migration: rename `pace` → `scenario` in your config, replace `ctx.vu`/`ctx.iter` with `ctx.vu.idInTest`/`ctx.vu.iterationInScenario`, regenerate the client with the new codegen.

### Minor Changes

- 7fac2ae: Cover the full k6 executor surface and fix a threshold-merge footgun.

  - `Scenario` and `Stage` types are re-exported from `k6/options`, so all seven k6 executors (`shared-iterations`, `per-vu-iterations`, `constant-arrival-rate`, `ramping-arrival-rate`, `externally-controlled`, plus the two VU variants) are reachable when a preset doesn't fit.
  - New `arrivalRate({ rps, duration, preAllocatedVUs })` and `rampingArrivalRate({ stages, preAllocatedVUs })` presets for open-model (throughput-driven) testing.
  - `LoadTestConfig` now accepts `handleSummary` for custom end-of-test output (JUnit, custom JSON, etc.) — re-export as `export const handleSummary = lt.handleSummary`.
  - `options.thresholds` is union-merged with `budgets` per metric instead of being silently overwritten — custom thresholds on `checks`, `iteration_duration`, custom metrics, or `abortOnFail` now coexist with `budgets`.
  - Pace presets carry ASCII timeline diagrams in their JSDoc so the shape is visible from the editor.
  - `@types/k6` moved from devDependencies to dependencies so consumers can resolve the re-exported `Scenario` / `Stage` / `Options` types.

## 0.2.0

### Minor Changes

- cecb5ba: Add `useAuth.session({ signIn, headerName })` for cookie/session auth (Better-Auth, NextAuth, Lucia) — one `signIn()` per VU, cached. Add per-scenario `baseUrl` override on `defineLoadTest({ baseUrl })` / `scenarios.X.baseUrl` so a single run can hit prod/staging/canary side-by-side. Expose `buildQuery`/`parseJson`/`mergeTags`/`getBaseUrl`/`setBaseUrl` from `@ahmedrowaihi/k6/runtime` so the generated client imports them instead of inlining the same helpers each time.

## 0.1.0

### Minor Changes

- 6c9e57d: Introduce the k6 load-testing track: a framework (`defineLoadTest`, `flow().step()`, pace presets, budgets, `useAuth` middleware), a standalone generator (`k6-gen.generate`) emitting a typed client + data builders, a CLI (`k6-tools init/sync/run`), and a thin hey-api plugin wrapper.
