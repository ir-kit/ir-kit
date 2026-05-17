---
"@ahmedrowaihi/k6-gen": minor
---

Two changes in one — `.spec()` per op + centralized request wiring in the preamble.

**`.spec(args)` per op.** Each generated operation now exposes a `.spec(args)` sibling returning `{ method, url, body, params }` — ready to feed into k6's `http.request()` or `http.batch()`. Lets users drop to raw k6 for response metadata, axios-style throwing, or http.batch parallelism without rebuilding URL templating, op tagging, header injection, or middleware-params wiring by hand.

```ts
import http from "k6/http";
import { check } from "k6";
import { parseJson } from "@ahmedrowaihi/k6/runtime";
import * as api from "./src/gen/index.js";

const { method, url, body, params } = api.getPetById.spec(1);
const res = http.request(method, url, body, params);
check(res, { "200": (r) => r.status === 200 });
if (res.status >= 500) throw new Error(`upstream ${res.status}`);
return parseJson(res);
```

**Centralized request wiring.** Per-op output is now one-line wrappers around preamble-resident helpers (`call<T>` / `callAsync<T>` / `buildSpec`). Before: ~30 lines per op (3 copies of URL/headers/params wiring across sync/async/spec). After: ~3 lines per op + helpers emitted once.

Generated client size shrinks ~4× on a typical OpenAPI spec — petstore went from ~1450 lines to ~435. Any future change to the request shape lands in one helper instead of N op-call sites.

Both changes are purely additive at the call-site API: `api.foo(...)`, `api.async.foo(...)`, and the new `api.foo.spec(...)` keep the same signatures and behavior. Internal codegen restructure is invisible to consumers.
