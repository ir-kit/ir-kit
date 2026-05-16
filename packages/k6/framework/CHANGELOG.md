# @ahmedrowaihi/k6

## 0.2.0

### Minor Changes

- cecb5ba: Add `useAuth.session({ signIn, headerName })` for cookie/session auth (Better-Auth, NextAuth, Lucia) — one `signIn()` per VU, cached. Add per-scenario `baseUrl` override on `defineLoadTest({ baseUrl })` / `scenarios.X.baseUrl` so a single run can hit prod/staging/canary side-by-side. Expose `buildQuery`/`parseJson`/`mergeTags`/`getBaseUrl`/`setBaseUrl` from `@ahmedrowaihi/k6/runtime` so the generated client imports them instead of inlining the same helpers each time.

## 0.1.0

### Minor Changes

- 6c9e57d: Introduce the k6 load-testing track: a framework (`defineLoadTest`, `flow().step()`, pace presets, budgets, `useAuth` middleware), a standalone generator (`k6-gen.generate`) emitting a typed client + data builders, a CLI (`k6-tools init/sync/run`), and a thin hey-api plugin wrapper.
