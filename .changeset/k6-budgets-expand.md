---
"@ahmedrowaihi/k6": minor
---

Expand `budgets:` to cover four common cases that previously required dropping to raw `options.thresholds`:

```ts
budgets: {
  // Existing (unchanged)
  p95: "500ms",
  p99: "1.5s",
  errors: "1%",
  ops: { listPets: { p95: "200ms" } },

  // NEW
  iterations: "100/m",          // → iterations: ['rate>1.667']  (per-sec rate)
  checks: "99%",                // → checks: ['rate>0.99']
  iterationDuration: { p95: "2s", p99: "5s" },
                                // → iteration_duration: ['p(95)<2000', 'p(99)<5000']
  abortOnFail: true,            // wraps every spec in `{ threshold, abortOnFail: true }`
  // abortOnFail: "10s",        // grace window (delayAbortEval)
}
```

All additive — pre-existing budgets compile to the same threshold strings as before. Anything still not modeled (`avg`/`min`/`max`/`med` aggregations, non-`http_req_duration` sub-timings, custom-metric thresholds, non-`operation:` tag filters) continues to work via `options.thresholds`, which union-merges per metric.

Also exports `Rate` type from `./format.js` and `parseRatePerSecond()` helper for callers that want to parse rate expressions (`"100/m"`, `"5/s"`, `"60/h"`) themselves.
