---
"@ahmedrowaihi/k6-gen": major
---

V2 — sync + async namespace per operation; runtime bridges; widened `CallOpts`.

**Per-operation async variant**: every generated operation gets an async sibling under the `async` namespace export, calling `http.asyncRequest` for true Go-side parallelism via `Promise.all`:

```ts
import * as api from "./gen/index.js";

// sync — http.request
const pet = api.getPet(1);

// async — http.asyncRequest, returns Promise<Pet>
const [pet, comments] = await Promise.all([
  api.async.getPet(1),
  api.async.getComments(1),
]);
```

**Runtime bridges in the client preamble**: the generated client now installs the framework's bridges (`installK6Bridge`, `setExecModule`, `installMetricsFactory`) at module load so `flow.check`/`flow.group`/`flow.sleep` and `lt.metrics` work without users wiring anything by hand.

**`CallOpts` widened**: per-request `opts` now includes `timeout`, `redirects`, `compression`, `responseType` (in addition to `headers` and `tags`). Forwarded directly to k6's request params.

**Internal middleware integration**: generated operations now spread `applyMiddlewareParams()` into the request params object so digest/NTLM auth middleware works.

Requires `@ahmedrowaihi/k6` ≥ 1.0 (v2).
