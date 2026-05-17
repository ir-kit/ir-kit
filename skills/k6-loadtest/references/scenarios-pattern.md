# Scenarios, budgets, and flow chains

## Pace presets

Each preset returns a `Scenario` object k6 understands. Mix them in named scenarios.

```ts
import { smoke, load, stress, spike, soak } from "@ahmedrowaihi/k6";

smoke({ duration: "30s" })                    // 1 VU baseline; verifies nothing's broken
load({ duration: "1m", vus: 20 })             // steady mid-traffic load
stress({ stages: ["1m:50", "2m:100", "30s:0"] })   // ramp up to find the breaking point
spike({ stages: ["30s:10", "30s:200", "1m:10"] })  // sudden burst then recovery
soak({ duration: "1h", vus: 10 })             // long-haul to surface memory leaks / DB exhaustion
```

## Budgets (k6 thresholds, but flat)

`budgets:` compiles to k6's nested `thresholds` block automatically.

```ts
defineLoadTest({
  pace: smoke(...),
  budgets: {
    p95: "500ms",          // http_req_duration p(95) < 500
    p99: "1s",
    errors: "1%",          // http_req_failed < 0.01
    iterations: ">100/m",  // iteration rate floor
  },
  flow: ...,
});
```

### Per-operation budgets

Tag-scoped budgets target a single operationId (every request is auto-tagged with `operation: "<opId>"`):

```ts
budgets: {
  p95: "500ms",
  byOp: {
    listPets:   { p95: "200ms" },
    createPet:  { p95: "800ms", errors: "0%" },
  },
}
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
      pace: load({ duration: "1m", vus: 10 }),
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

### Per-scenario baseUrl

Lets one run hit prod/staging/canary side-by-side:

```ts
scenarios: {
  prod:    { pace: smoke(...), flow: ..., baseUrl: "https://prod.example.com" },
  staging: { pace: smoke(...), flow: ..., baseUrl: "https://staging.example.com" },
}
```

The runtime swaps the generated client's BASE_URL per scenario via `setBaseUrl` / `getBaseUrl` — no manual env juggling required.

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
