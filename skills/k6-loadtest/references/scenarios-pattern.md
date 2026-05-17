# Scenarios, budgets, and flow chains

## Pace presets

Each preset returns a k6 [`Scenario`](https://grafana.com/docs/k6/latest/using-k6/scenarios/) literal — a recipe for "how many VUs (or how much throughput) over time." Each function's JSDoc carries an ASCII timeline so the shape is visible from your editor.

```ts
import {
  arrivalRate,
  load,
  rampingArrivalRate,
  smoke,
  soak,
  spike,
  stress,
} from "@ahmedrowaihi/k6";

smoke({ vus: 1, duration: "30s" });
// constant-vus baseline — 1 VU × 30s.

load({ target: 20, rampUp: "30s", hold: "1m", rampDown: "30s" });
// ramping-vus — rampUp → hold at target → rampDown to 0.

stress({ ceiling: 100, step: 25, perStep: "1m" });
// ramping-vus — climbs in rungs to ceiling, then ramps down.

spike({ baseline: 10, peak: 200, spikeDuration: "30s", recoverDuration: "1m" });
// ramping-vus — baseline → sudden peak → recover.

soak({ vus: 10, duration: "1h" });
// constant-vus — long-haul; surfaces leaks and downstream saturation.

arrivalRate({ rps: 500, duration: "1m", preAllocatedVUs: 100 });
// constant-arrival-rate (open model) — 500 req/sec regardless of API latency.

rampingArrivalRate({
  preAllocatedVUs: 50,
  stages: [
    { duration: "30s", target: 100 }, // ramp 0 → 100 RPS
    { duration: "2m",  target: 100 }, // hold
    { duration: "30s", target: 0 },
  ],
});
// ramping-arrival-rate (open model) — target is iterations/timeUnit, not VUs.
```

### Closed model vs open model — short version

- **VU-based** (`smoke`/`load`/`stress`/`spike`/`soak`): N users hammer the API as fast as their requests complete. Throughput = whatever they manage. Realistic-user simulation.
- **Arrival-rate** (`arrivalRate`/`rampingArrivalRate`): X requests/sec arrive regardless of API speed. k6 spawns more VUs (up to `maxVUs`) to keep up. Right model for **SLO testing** ("must handle 500 RPS").

## Roll-your-own scenarios — auth/budgets/flow still apply

`scenario:` accepts *any* k6 `Scenario` literal. The framework's auth, budgets, and flow are orthogonal to which scenario shape you pick — useful when no preset fits (e.g. `shared-iterations`, `per-vu-iterations`, `externally-controlled`):

```ts
import {
  defineLoadTest,
  flow,
  useAuth,
  type Scenario,
} from "@ahmedrowaihi/k6";
import * as api from "./gen/index.js";

// Hand-rolled — k6's `shared-iterations` executor (no preset for it).
const fixedRunsPerVU: Scenario = {
  executor: "shared-iterations",
  vus: 10,
  iterations: 1000,
  maxDuration: "5m",
  gracefulStop: "30s",       // any k6 scenario field is available
};

const lt = defineLoadTest({
  use: [useAuth.bearer({ env: "API_TOKEN" })],   // ← auth still applies
  budgets: { p95: "500ms", errors: "1%" },       // ← per-op tagged budgets still apply
  scenario: fixedRunsPerVU,                      // ← raw Scenario literal
  flow: flow()                                   // ← typed flow chain still works
    .step("create", () => api.addPet(data.Pet()))
    .step("delete", (pet) => api.deletePet(pet.id!)),
});

export const options = lt.options;
export default lt.default;
```

You can also **spread** a preset and add scenario-level fields:

```ts
scenarios: {
  write: {
    scenario: {
      ...load({ target: 10 }),
      gracefulRampDown: "30s",   // wait for in-flight iterations at rampdown
      startTime:        "1m",    // delayed start (compose with other scenarios)
      tags:             { tier: "write" },
    },
    flow: ...,
  },
}
```

## Budgets (k6 thresholds, but flat)

`budgets:` compiles to k6's nested `thresholds` block automatically.

```ts
defineLoadTest({
  scenario: smoke(),
  budgets: {
    p95: "500ms",         // → http_req_duration: ['p(95)<500']
    p99: "1.5s",          // → http_req_duration: ['p(99)<1500']
    errors: "1%",         // → http_req_failed: ['rate<0.01']
  },
  flow: ...,
});
```

### Per-operation budgets

`ops:` keys target a single operationId — every generated request is auto-tagged with `{operation: "<opId>"}`:

```ts
budgets: {
  p95: "500ms",
  ops: {
    getPetById: { p95: "200ms" },
    addPet:     { p95: "800ms", errors: "0%" },
  },
}
```

### Custom thresholds beyond budgets

`budgets` only models the three HTTP basics (`http_req_duration`, `http_req_failed`, per-op variants). For anything else — `checks`, `iteration_duration`, custom metrics, `abortOnFail` — drop into `options.thresholds`. The two maps **union-merge per metric**, so they coexist:

```ts
defineLoadTest({
  scenario: smoke(),
  budgets: { p95: "500ms" },
  options: {
    thresholds: {
      checks: ["rate>0.99"],
      iteration_duration: [{ threshold: "p(95)<2000", abortOnFail: true }],
      my_custom_metric: ["count<10"],
    },
  },
  flow: ...,
});
```

## Custom metrics — declared once

Declare metrics on the config; the compiled `lt.metrics` handle gives you typed `.add()`:

```ts
const lt = defineLoadTest({
  scenario: smoke(),
  metrics: {
    cacheHits:    "counter",   // → k6/metrics Counter
    activeCarts:  "gauge",     // → k6/metrics Gauge
    payloadBytes: "trend",     // → k6/metrics Trend
    successRate:  "rate",      // → k6/metrics Rate
  },
  flow: flow().step("read", (_, ctx) => {
    const res = api.getPet(1);
    lt.metrics.cacheHits.add(res.cached ? 1 : 0);
    lt.metrics.payloadBytes.add(JSON.stringify(res).length, { tier: "read" });
    return res;
  }),
});
```

Threshold them via `options.thresholds`:

```ts
options: {
  thresholds: {
    cacheHits: ["count>100"],
    payloadBytes: ["p(95)<10000"],
  },
}
```

## Per-VU state

`perVU:` runs once at the start of each VU's first iteration. The returned value is threaded into every `ctx.vuState` for that VU:

```ts
defineLoadTest<{ token: string; correlationId: string }>({
  perVU: () => ({
    token: signIn(),                          // expensive, do once per VU
    correlationId: crypto.randomUUID(),
  }),
  scenario: smoke(),
  flow: flow().step("authed-read", (_, ctx) =>
    api.getMe({
      headers: {
        Authorization: `Bearer ${ctx.vuState.token}`,
        "X-Correlation-Id": ctx.vuState.correlationId,
      },
    }),
  ),
});
```

## Named scenarios

When the loadtest covers multiple distinct flows (browse vs write, public vs authenticated):

```ts
const lt = defineLoadTest({
  use: [auth],
  scenarios: {
    browse: {
      scenario: smoke({ duration: "30s" }),
      flow: flow().step("list", () => api.listPets()),
    },
    write: {
      scenario: load({ target: 10 }),
      flow: flow()
        .step("create", () => api.addPet(data.Pet()))
        .step("delete", (pet) => api.deletePet(pet.id)),
    },
  },
});
```

Running the bundle directly (`k6 run dist/loadtest.js`) — or via `runK6` programmatically — executes all scenarios concurrently because every entry lands in `options.scenarios`. To run one in isolation, pass `--exec browse` to k6:

```ts
await runK6({
  entry: "./loadtest.ts",
  extraArgs: ["--exec", "browse"],
});
```

## Flow chains

`flow()` is a builder. Six fluent ops compose into a typed pipeline:

```ts
flow()
  .step("create", () => api.addPet(data.Pet()))                  // → Pet (sync)
  .step("read",   async (pet) => api.async.getPetById(pet.id))   // → Pet (async)
  .batch("fan-out", (pet) => ({                                  // labeled parallel
    pet,
    comments: api.async.getComments(pet.id),
    related:  api.async.getRelatedPets(pet.id),
  }))                                                            // → { pet, comments, related }
  .group("verify", (sub) => sub                                  // wraps in k6 group()
    .step("price", (data) => api.getPrice(data.pet.id))
    .step("confirm", (p) => api.confirmOrder(p)))
  .check("status ok", (order) => order.status === "confirmed")   // soft check; feeds `checks` rate
  .sleep("500ms")                                                // typed sleep
  .expect((order) => order.id !== undefined)                     // hard fail on false
  .step("cleanup", (order) => api.deletePet(order.petId));
```

### `step` vs `batch` vs `group`

- **`step(label, fn)`**: sequential. `fn` may be sync **or async**; framework awaits Promise returns.
- **`batch(label, fn)`**: parallel. `fn` returns an object whose Promise values are awaited via `Promise.all`. Pair with `api.async.*` for true Go-side parallel HTTP. Sync values pass through.
- **`group(label, sub => sub.step(...))`**: wraps a sub-flow in k6's `group()` so every request/check inside carries the `group:<label>` tag for tag-scoped budgets.

### `check` vs `expect`

| Op | What it does | Iteration fate |
|---|---|---|
| `.check(name, v => bool)` | Records pass/fail to k6's `checks` rate metric | Continues regardless |
| `.expect(v => bool, msg?)` | Throws `FlowExpectError` on false | Iteration ends, k6 counts as failed |

Use `.check()` for "I want to track success rate of this assertion across the test." Use `.expect()` for "if this is wrong, the rest of the flow makes no sense — stop now."

### `Ctx` inside steps

Each step receives `(input, ctx)`. `ctx` is the framework's typed facade over k6's [`exec` module](https://k6.io/docs/javascript-api/k6-execution/) — no need to `import "k6/execution"` directly:

```ts
.step("introspect", (pet, ctx) => {
  ctx.vu.idInTest;                       // global VU number
  ctx.vu.iterationInScenario;
  ctx.vu.tags["custom"] = "value";       // mutable per-VU tags
  ctx.scenario.name;
  ctx.scenario.progress;                 // 0..1
  ctx.instance.vusActive;
  ctx.instance.currentTestRunDuration;
  if (pet.status === "invalid") ctx.test.abort("invalid pet state");
  ctx.env("API_TOKEN");                  // env var (throws if missing, unless default given)
  ctx.vuState;                           // per-VU state from `defineLoadTest({ perVU })`
  return pet;
})
```

### Drop to raw k6 when you need something we don't model

The framework is a scaffold *over* k6. WebSocket, gRPC, browser tests, Redis fixtures, `SharedArray`, `k6/crypto`, etc. — all reachable from inside a step:

```ts
import { Counter } from "k6/metrics";
import http from "k6/http";

const extraCounter = new Counter("legacy_hits");

flow().step("legacy", () => {
  const res = http.get("https://other-service.example.com/legacy");
  extraCounter.add(1);
  return res.json();
});
```

For non-HTTP protocols (WebSocket, gRPC, browser), add jslib URLs / module names to `bundle.external` when running through `runK6` so the bundler doesn't try to inline them.

### Per-scenario baseUrl

Lets one run hit prod/staging/canary side-by-side:

```ts
scenarios: {
  prod:    { scenario: smoke(...), flow: ..., baseUrl: "https://prod.example.com" },
  staging: { scenario: smoke(...), flow: ..., baseUrl: "https://staging.example.com" },
}
```

The runtime swaps the generated client's BASE_URL per scenario via `setBaseUrl` / `getBaseUrl` — no manual env juggling required.

## Custom end-of-test output (`handleSummary`)

k6's `handleSummary(data)` lets you write JUnit, custom JSON, or upload to your observability stack. Surface it on `LoadTestConfig` and re-export the result:

```ts
const lt = defineLoadTest({
  scenario: smoke(),
  flow: ...,
  handleSummary: (data) => ({
    "summary.json": JSON.stringify(data, null, 2),
    "junit.xml":    toJUnit(data),
  }),
});

export const options = lt.options;
export default lt.default;
export const handleSummary = lt.handleSummary;
```

See [k6 custom summary docs](https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/) for the `data` shape.

## CLI overrides (when invoking via `runK6`)

The `runK6` opts mirror common k6 CLI flags. Anything not surfaced gets passed through `extraArgs`:

```ts
await runK6({
  entry: "./loadtest.ts",
  vus: "50",                    // → --vus 50
  duration: "1m",               // → --duration 1m
  baseUrl: "https://...",       // → -e BASE_URL=...
  out: ["json=results.json"],   // → --out json=results.json (repeats per entry)
  summary: "summary.json",      // → --summary-export=summary.json
  extraArgs: ["--http-debug", "--exec", "browse"],
});
```
