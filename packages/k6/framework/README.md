# @ahmedrowaihi/k6

Framework for authoring [k6](https://k6.io) load tests in TypeScript. The single package you import from your `loadtest.ts` — compiles down to standard k6 (`export const options` + `export default function`).

## Why

Raw k6 forces you to write threshold strings, magic globals (`__VU`, `__ITER`, `__ENV`), and unstructured `default()` bodies. This framework gives you typed scenarios, step chaining, flat budgets, and reusable auth middleware. The runtime is small — it compiles to vanilla k6, so there's nothing to learn beyond k6's mental model.

## API

```ts
import {
  defineLoadTest,
  flow,
  smoke, load, stress, spike, repro, soak,
  useAuth,
} from "@ahmedrowaihi/k6";
```

### `defineLoadTest(config)`

```ts
const lt = defineLoadTest({
  use?:        Middleware[],                       // auth helpers, etc.
  budgets?:    { p95, p99, errors, ops },          // compiled to k6 thresholds
  pace?:       Scenario,                            // shorthand single-scenario
  test?:       () => void,                          //   …with this body
  flow?:       FlowBuilder<any>,                    //   …or this chain
  scenarios?:  Record<string, ScenarioConfig>,     // named, each gets own exec
  setup?:      () => unknown,
  teardown?:   (data) => void,
});

export const options = lt.options;
export default lt.default;
export const { browse, write } = lt.scenarios; // when scenarios named
```

### `flow().step(...)`

```ts
flow()
  .step("create",  ()    => api.addPet(data.Pet()))   // Pet
  .step("read",    (pet) => api.getPetById(pet.id!))  // pet typed as Pet
  .expect((pet) => pet.status === "available")
  .step("delete",  (pet) => api.deletePet(pet.id!))
```

Each step's return value flows into the next step's input with type inference. `expect()` records a failed check and aborts the chain when the predicate returns false.

### Pace presets

- `smoke({ vus, duration })` — CI sanity
- `load({ target, rampUp, hold, rampDown })` — steady-state
- `stress({ ceiling, step, perStep })` — climb to find the cliff
- `spike({ baseline, peak, spikeDuration, recoverDuration })` — elasticity
- `repro({ vus, duration })` — bug isolation under concurrency
- `soak({ vus, duration })` — long flat run

### `useAuth`

```ts
useAuth.bearer({ env: "API_TOKEN" })
useAuth.basic({ user, pass })
useAuth.apiKey({ name: "X-API-Key", env: "API_KEY" })
useAuth.custom({ headers: () => ({ "X-Trace": traceId() }) })
```

Middlewares are applied at request time by the generated client. Pass via `defineLoadTest({ use: [...] })`.

### Budgets

```ts
budgets: {
  p95: "500ms",                   // → http_req_duration: ['p(95)<500']
  p99: "1.5s",                    // → http_req_duration: ['p(99)<1500']
  errors: "1%",                   // → http_req_failed:   ['rate<0.01']
  ops: {
    getPetById: { p95: "100ms" }, // → http_req_duration{operation:getPetById}: ['p(95)<100']
    addPet:     { errors: "0%" },
  },
}
```

Per-op budgets resolve because the generated client tags every request with `{ operation: <opId> }`.

## See also

- [@ahmedrowaihi/k6-gen](../gen) — typed client generator
- [@ahmedrowaihi/k6-tools](../tools) — CLI
- [examples/k6-petstore](../../../examples/k6-petstore/) — end-to-end demo
