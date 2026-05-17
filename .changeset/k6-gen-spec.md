---
"@ahmedrowaihi/k6-gen": minor
---

Every generated operation now exposes a `.spec(args)` sibling that returns the request bits (`{ method, url, body, params }`) ready to feed into k6's `http.request()` or `http.batch()`. Lets users drop to raw k6 for response-metadata access, axios-style throwing, or `http.batch()` parallelism — without rebuilding URL / op tagging / header injection / middleware-params wiring by hand.

```ts
import http from "k6/http";
import { check } from "k6";
import * as api from "./src/gen/index.js";

flow().step("manual control", () => {
  const { method, url, body, params } = api.getPetById.spec(1);
  const res = http.request(method, url, body, params);
  check(res, { "200": (r) => r.status === 200 });
  if (res.status >= 500) throw new Error(`upstream ${res.status}`);
  return parseJson(res);
});

// Parallel via http.batch (k6's batch primitive beyond Promise.all):
flow().step("batch", () => {
  const specs = [1, 2, 3].map((id) => api.getPetById.spec(id));
  return http.batch(specs.map((s) => [s.method, s.url, s.body, s.params]))
    .map((r) => parseJson(r));
});
```

Args match the sync function exactly (path params, query, body, opts). No new namespace — `.spec` is a property on the existing function. Additive — pre-existing `api.<op>()` and `api.async.<op>()` are unchanged.

Internal refactor: `paramsExpression()` now takes the `headers` expression as a parameter so it can be reused in both the sync function (where `headers` is a local const) and the `.spec` arrow (where the headers expression is inlined).
