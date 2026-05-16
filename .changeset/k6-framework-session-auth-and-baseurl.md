---
"@ahmedrowaihi/k6": minor
---

Add `useAuth.session({ signIn, headerName })` for cookie/session auth (Better-Auth, NextAuth, Lucia) — one `signIn()` per VU, cached. Add per-scenario `baseUrl` override on `defineLoadTest({ baseUrl })` / `scenarios.X.baseUrl` so a single run can hit prod/staging/canary side-by-side. Expose `buildQuery`/`parseJson`/`mergeTags`/`getBaseUrl`/`setBaseUrl` from `@ahmedrowaihi/k6/runtime` so the generated client imports them instead of inlining the same helpers each time.
