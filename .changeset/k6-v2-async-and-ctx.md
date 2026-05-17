---
"@ahmedrowaihi/k6": major
---

V2 — async + full k6 exec surface + fluent ops + custom metrics + digest/ntlm auth.

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
