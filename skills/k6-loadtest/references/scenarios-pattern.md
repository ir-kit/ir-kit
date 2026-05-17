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

`pace:` accepts *any* k6 `Scenario` literal. The framework's auth, budgets, and flow are orthogonal to which scenario shape you pick — useful when no preset fits (e.g. `shared-iterations`, `per-vu-iterations`, `externally-controlled`):

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
  pace: fixedRunsPerVU,                          // ← raw Scenario literal
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
    pace: {
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
  pace: smoke(),
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
  pace: smoke(),
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

## Named scenarios

When the loadtest covers multiple distinct flows (browse vs write, public vs authenticated):

```ts
const lt = defineLoadTest({
  use: [auth],
  scenarios: {
    browse: {
      pace: smoke({ duration: "30s" }),
      flow: flow().step("list", () => api.listPets()),
    },
    write: {
      pace: load({ target: 10 }),
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

`flow()` is a builder. Each `.step("label", fn)` adds a step; `fn` receives the previous step's return value:

```ts
flow()
  .step("create", () => api.addPet(data.Pet()))                  // → Pet
  .step("read",   (pet) => api.getPetById(pet.id))               // → Pet (typed end-to-end)
  .step("update", (pet) => api.updatePet({ ...pet, status: "sold" }))
  .expect((pet) => pet.status === "sold")                        // assertion
  .step("cleanup", (pet) => api.deletePet(pet.id));
```

`.expect(fn)` fails the iteration if the predicate is falsy. Use it to gate on response correctness, not just status codes.

### Async vs sync

All step functions are sync from k6's perspective (k6 runs JS in a fiber-style VM). Don't `await` — return the raw response or transformed value.

### Raw k6 inside steps

Step bodies run in VU context, so anything `k6/*` ships is fair game. Reach for it when the framework doesn't model what you need:

```ts
import { check, group } from "k6";
import { Counter, Trend } from "k6/metrics";
import exec from "k6/execution";

const cacheHits = new Counter("cache_hits");
const payloadBytes = new Trend("payload_bytes");

flow().step("read", (pet) => {
  return group("read pet", () => {
    const res = api.getPetById(pet.id);
    check(res, { "has id": (r) => r?.id !== undefined });
    payloadBytes.add(JSON.stringify(res).length);
    if (res.cached) cacheHits.add(1);
    if (exec.vu.iterationInScenario > 100) exec.test.abort("ran enough");
    return res;
  });
});
```

The framework reads `__VU`, `__ITER`, and `__ENV` for `StepCtx`. For richer execution metadata (`scenario.name`, `instance.vusActive`, `test.abort()`), import `k6/execution` directly.

### Per-scenario baseUrl

Lets one run hit prod/staging/canary side-by-side:

```ts
scenarios: {
  prod:    { pace: smoke(...), flow: ..., baseUrl: "https://prod.example.com" },
  staging: { pace: smoke(...), flow: ..., baseUrl: "https://staging.example.com" },
}
```

The runtime swaps the generated client's BASE_URL per scenario via `setBaseUrl` / `getBaseUrl` — no manual env juggling required.

## Custom end-of-test output (`handleSummary`)

k6's `handleSummary(data)` lets you write JUnit, custom JSON, or upload to your observability stack. Surface it on `LoadTestConfig` and re-export the result:

```ts
const lt = defineLoadTest({
  pace: smoke(),
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
