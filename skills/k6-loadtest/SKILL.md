---
name: k6-loadtest
description: Load-test an HTTP API with the @ir-kit/k6 v2 stack — generate a typed k6 client (sync + async parallel via http.asyncRequest) from an OpenAPI spec, scaffold scenario files interactively or via flags, then bundle and spawn k6 (CLI or programmatic). Use when the user wants to write k6 load tests in TypeScript, perf-test an API from its OpenAPI spec, run smoke/load/stress/spike/soak/arrival-rate scenarios, do parallel fan-out from one VU, declare custom metrics, write group/check assertions, scaffold scenarios from spec tags, or invoke `k6 run` from a script. Triggers on "load test", "perf test", "k6", "stress test the API", "spike test", "soak test", "smoke test", "arrival rate", "RPS test", "parallel HTTP", "scaffold scenario", "k6-ts", "k6-ts scaffold", `defineLoadTest`, `runK6`, `useAuth`, `arrivalRate`, `rampingArrivalRate`, `handleSummary`, `flow.batch`, `flow.group`, `flow.check`, "k6 scenarios", "k6 budgets", "k6 thresholds", "OpenAPI to k6". Do NOT use for unit tests, integration tests, non-HTTP workloads, or generic Go-based k6 scripting unrelated to the @ir-kit/k6 framework.
---

# k6 load testing — `@ir-kit/k6` v2

Generate a typed k6 client from an OpenAPI spec (sync + async variants), scaffold a runnable loadtest, then bundle and spawn k6. All programmatic — no shelling out, no `Bun.spawn`, no `npx`.

## When to reach for this

- User has an OpenAPI spec and wants k6 load tests against the API.
- User is writing a perf harness, CI perf gate, or local stress test.
- User mentions `defineLoadTest`, `flow().step()`/`.batch()`/`.group()`/`.check()`, `useAuth`, named scenarios, budgets, pace presets, or k6 `Scenario` shape.
- User wants parallel HTTP from one VU iteration (open model: `http.asyncRequest` + `Promise.all` or `flow().batch()`).

Skip this skill for: framework-agnostic k6 scripting, JS-based unit tests, non-HTTP perf work (WS/gRPC/browser/Redis — drop to raw k6 inside a step).

## The three packages

| Package | Role |
|---|---|
| `@ir-kit/k6` | Runtime framework — `defineLoadTest`, `flow`, `useAuth`, pace presets, async `Ctx`. Imported by the user-written `loadtest.ts`. |
| `@ir-kit/k6-gen` | Codegen — OpenAPI spec → typed client (`client.ts`, `types.ts`, `data.ts`). Emits sync + `async` namespace per op. |
| `@ir-kit/k6-toolkit` | Programmatic API the user calls from scripts. Re-exports `generate` from k6-gen. Also ships the `k6-ts` CLI. |

For a brand-new project, the cowpath is **`npm create @ir-kit/k6`** — interactive wizard that runs `init()`.

## End-to-end pipeline: HAR → typed loadtest

When the user has no spec, the full chain from captured browser traffic to a runnable typed loadtest is now four shell lines:

```bash
# 1. HAR → OpenAPI spec (from openapi-recon)
openapi-recon ./traffic.har --out spec.json

# 2. Spec → typed k6 client (gen/client.ts, types.ts, data.ts, index.ts)
k6-ts sync ./spec.json --output ./src/gen

# 3. Scaffold one scenario per tag (or pick ops manually)
k6-ts scaffold --spec ./spec.json --tags pets --output-dir loadtests/

# 4. Run with live charts
K6_WEB_DASHBOARD=true k6-ts run loadtests/pets.ts
```

Steps 1-2 also chain via stdin so no intermediate file is needed:

```bash
openapi-recon ./traffic.har | k6-ts sync - --output ./src/gen
```

Each step works standalone — pick the entry that matches what you have (HAR, spec, gen output, loadtest file).

## The `k6-ts` CLI — drop-in `k6` replacement for TypeScript entries

Installed with `@ir-kit/k6-toolkit`. Behaves exactly like `k6` from the terminal except it bundles `.ts` entries on the fly (tsdown, `k6`/`k6/*` external, `.k6-ts-cache/` for output). cwd is preserved so `open("./fixtures/data.csv")` resolves as expected. SIGINT/SIGTERM forwarded to k6; signal-killed runs return `128+signum`.

```bash
# Runs k6 against the bundled output of loadtest.ts
k6-ts run loadtest.ts --vus 50 --duration 1m
k6-ts run loadtest.ts -e BASE_URL=https://staging.example.com --out json=results.json
k6-ts archive loadtest.ts -O archive.tar
k6-ts inspect loadtest.ts

# Anything without a .ts entry passes straight through to k6
k6-ts version
k6-ts --help
```

Use it when you want `k6`-CLI muscle memory without a `pnpm run` wrapper. For CI scripts or custom orchestration, reach for the programmatic `runK6()` instead.

## `k6-ts sync` — spec → typed client CLI

```bash
# File or URL
k6-ts sync ./openapi.yaml --output ./src/gen
k6-ts sync https://api.example.com/openapi.json --output ./src/gen

# Compose with openapi-recon (HAR → spec → typed client)
openapi-recon ./traffic.har | k6-ts sync - --output ./src/gen

# Per-spec base URL override
k6-ts sync ./openapi.yaml --output ./src/gen --base-url https://staging.example.com

# Emit one stub loadtest per operation alongside the client
k6-ts sync ./openapi.yaml --output ./src/gen --scaffold

# Diff op-ids against the prior sync (useful in CI after spec changes)
k6-ts sync ./openapi.yaml --output ./src/gen --report-renames
```

Flags: `--output`, `--base-url`, `--scaffold`, `--no-normalize`, `--dry-run`, `--report-renames`, `--help`. Wraps the existing programmatic `sync()` API — same options, same output.

## `k6-ts scaffold` — interactive + flag-driven scenario generator

Three modes, same backing scaffolder:

```bash
# 1. Interactive wizard — picks tags, ops, chain, pace, auth from prompts
k6-ts scaffold

# 2. Discovery — list ops grouped by tag (agent-friendly)
k6-ts scaffold list-ops --spec ./openapi.yaml
k6-ts scaffold list-ops --spec ./openapi.yaml --json

# 3. Flag-driven (non-interactive, CI/agent)
k6-ts scaffold \
  --spec ./openapi.yaml \
  --name browse-pets \
  --ops findPetsByStatus,getPetById \
  --chain sequential \
  --pace smoke \
  --auth bearer \
  --output ./loadtests/browse-pets.ts

# 4. Batch — one scenario per tag with smart defaults
k6-ts scaffold --spec ./openapi.yaml --tags pet,user --output-dir ./loadtests
```

**Output**: one standalone `.ts` file per scenario. Self-contained (own `options`, `default`, budgets, auth). Run via `k6-ts run ./loadtests/browse-pets.ts`.

**Chain modes**:
- `sequential` — `.step("op1", () => api.op1()).step("op2", () => api.op2())`. Output of one feeds the next.
- `batch` — `.batch("fan-out", () => ({ a: api.async.op1(), b: api.async.op2() }))`. True parallel via `http.asyncRequest` + `Promise.all`.

**Workflow for agents**: call `list-ops --json` to discover, then pick ops and call `scaffold --name ... --ops ...`. No YAML config needed — the spec is the source of truth.

Generated files have placeholder args (`api.getPet(petId)`, `api.addPet({})`) — you fill those in. The scaffold gives you the shape, you fill the body.

## First-run quick start (new project)

```bash
npm create @ir-kit/k6
```

The wizard asks for:
- Path or URL to the OpenAPI spec
- Output dir for the typed client (default `./src/gen`)
- Auth flavor — `none` / `bearer` / `basic` / `apiKey` / `session` / `digest` / `ntlm`
- Single test or named scenarios
- Whether to emit one stub loadtest per spec operation

## Programmatic equivalent (in a script)

```ts
import { init, sync, runK6 } from "@ir-kit/k6-toolkit";

await init({
  input: "./openapi.yaml",      // path, URL, or pre-parsed spec object
  output: "./src/gen",
  auth: "bearer",
  bearerEnv: "API_TOKEN",
  pace: "smoke",
  duration: "30s",
});

await sync({ input: "./openapi.yaml", output: "./src/gen", reportRenames: true });

const { exitCode, outfile } = await runK6({
  entry: "./loadtest.ts",
  baseUrl: "https://staging.example.com",
  vus: "50",
  duration: "1m",
  out: ["json=results.json"],
  summary: "./summary.json",
});
```

`runK6` resolves to `{ exitCode, outfile }`. Signal-killed processes resolve to `128 + signum` per POSIX. Errors throw.

## Writing the loadtest

```ts
import { defineLoadTest, flow, smoke, useAuth } from "@ir-kit/k6";
import * as api from "./src/gen/index.js";

const auth = useAuth.bearer({ env: "API_TOKEN" });

const lt = defineLoadTest({
  use: [auth],
  scenario: smoke({ duration: "30s" }),          // ← v2: was `pace:`
  budgets: { p95: "500ms", errors: "1%" },
  flow: flow()
    .step("list-pets", () => api.listPets())
    .step("read-first", (pets) => {
      if (!pets.length) return null;
      return api.getPet(pets[0].id);
    })
    .expect((pet) => pet !== null && pet.id !== undefined),
});

export const options = lt.options;
export default lt.default;                       // async; k6 awaits it per iteration
// export const handleSummary = lt.handleSummary;
```

`flow().step("name", (input, ctx) => ...)` chains operations and threads return values forward. **Steps may be sync or async** — the framework awaits Promise returns. `.expect(fn)` runs a hard-fail assertion.

## Parallel HTTP — the `async` namespace + `flow.batch()`

Every generated operation has a sync form (`api.getPet(1)`) and an async form (`api.async.getPet(1)`) that uses `http.asyncRequest()` for true Go-side parallelism. Two ways to use it:

```ts
// Inline Promise.all — for ad-hoc fan-out inside a step
.step("page-load", async (id) => {
  const [pet, comments, related] = await Promise.all([
    api.async.getPet(id),
    api.async.getComments(id),
    api.async.getRelatedPets(id),
  ]);
  return { pet, comments, related };
})

// flow.batch() — labeled object form; per-branch step tagging
.batch("page-load", (id) => ({
  pet:      api.async.getPet(id),
  comments: api.async.getComments(id),
  related:  api.async.getRelatedPets(id),
}))  // → { pet: Pet, comments: Comment[], related: Pet[] }
```

## v2 fluent ops

| Op | Purpose | Maps to k6 |
|---|---|---|
| `.step("label", fn)` | Sequential step; sync or async return; result threads forward | (none — our DSL) |
| `.batch("label", (in) => ({ k: ... }))` | Labeled parallel; awaits Promise values | `Promise.all` over `http.asyncRequest` |
| `.group("name", (sub) => sub.step(...))` | Wraps sub-flow; metrics carry `group:` tag | `group(name, fn)` |
| `.check("name", v => bool)` | Soft check; feeds `checks` rate metric; does NOT fail iteration | `check(value, sets)` |
| `.expect(v => bool, msg?)` | Hard assertion; fails iteration on `false` | `throw` |
| `.sleep("500ms" \| 1)` | Pause | `sleep(seconds)` |

## `Ctx` — full `exec` surface

Each step receives `(input, ctx)` where `ctx` exposes k6's [`exec` module](https://k6.io/docs/javascript-api/k6-execution/):

```ts
.step("introspect", (_, ctx) => {
  ctx.vu.idInTest;                 // global VU number
  ctx.vu.iterationInScenario;
  ctx.vu.tags["custom"] = "value"; // mutable per-VU tag map
  ctx.scenario.name;
  ctx.scenario.progress;           // 0..1
  ctx.instance.vusActive;
  ctx.instance.currentTestRunDuration;
  if (someCondition) ctx.test.abort("hit invalid state");
  ctx.env("API_TOKEN");            // env var read with optional default
  ctx.vuState;                     // per-VU state from `defineLoadTest({ perVU: () => ... })`
})
```

## Custom metrics

Declare once on the config; reference typed through `lt.metrics`:

```ts
const lt = defineLoadTest({
  metrics: { cacheHits: "counter", payloadBytes: "trend" },
  scenario: smoke(),
  flow: flow().step("read", (_, _ctx) => {
    const res = api.getPet(1);
    lt.metrics.cacheHits.add(res.cached ? 1 : 0);
    lt.metrics.payloadBytes.add(JSON.stringify(res).length);
    return res;
  }),
});
```

Backed by `k6/metrics` Counter/Gauge/Rate/Trend.

## Per-VU state (`perVU`)

Runs once at the start of each VU's first iteration; result threads into `ctx.vuState`:

```ts
defineLoadTest<{ token: string }>({
  perVU: () => ({ token: signInOnce() }),
  scenario: smoke(),
  flow: flow().step((_, ctx) => api.getMe({ headers: { Authorization: `Bearer ${ctx.vuState.token}` }})),
});
```

## Multi-scenario

```ts
const lt = defineLoadTest({
  use: [auth],
  scenarios: {
    browse: {
      scenario: smoke({ duration: "30s" }),    // ← v2: was `pace:`
      flow: flow().step("list", () => api.listPets()),
    },
    write: {
      scenario: load({ target: 20 }),
      flow: flow().step("create", () => api.addPet(data.Pet())),
      baseUrl: "https://write-replica.example.com",
    },
  },
});

export const options = lt.options;
export default lt.default;
export const browse = lt.scenarios.browse;
export const write  = lt.scenarios.write;
```

See [references/auth-recipes.md](references/auth-recipes.md) for the full auth surface (bearer / basic / apiKey / session / custom / **digest** / **ntlm**).
See [references/scenarios-pattern.md](references/scenarios-pattern.md) for budgets, per-op overrides, raw-k6 escape hatches, and `handleSummary`.

## v2 breaking changes (migrating from v1)

| Before | After |
|---|---|
| `pace: smoke(...)` | `scenario: smoke(...)` |
| `scenarios.x.pace:` | `scenarios.x.scenario:` |
| `StepCtx` (vu/iter/env) | `Ctx` (vu/scenario/instance/test/vuState/env) |
| `ctx.vu` (number) | `ctx.vu.idInTest` |
| `ctx.iter` (number) | `ctx.vu.iterationInScenario` |
| `flow().run(ctx)` returns `T` | `flow().run(ctx)` returns `Promise<T>` — default export is async |
| Sync-only steps | Steps may be sync **or async** |

## Common pitfalls

- **`out:` is an array, not a comma string** — `out: ["json=a.json"]`, not `"json=a.json,csv=b.csv"`.
- **`cwd` matters when running from a subdirectory** — pass `cwd: __dirname` if the caller's script lives outside the project root.
- **k6's VM only supports a subset of JS.** Externals (`k6`, `k6/*`) are auto-marked external by the bundler; jslib URLs must be added to `bundle.external`.
- **Signal-killed runs return `128 + signum`** — check for signal interruption before treating as a perf failure.
- **The generated `client.ts` self-installs k6 runtime bridges** as top-level side effects (`installK6Bridge`, `setExecModule`, `installMetricsFactory`). Importing any named operation from `./gen/index.js` or `./gen/client.js` triggers those side effects, and ESM hoists imports so order doesn't matter. Just don't bundle with tree-shaking that drops the top-level side-effect statements.
- **`api.async.<op>` returns `Promise<T>`, `api.<op>` returns `T`** — match the call site to whether you're inside an async step or sync.

## How AI agents should use this

1. If the user is starting fresh → suggest `npm create @ir-kit/k6`.
2. If the user is writing a perf-harness script → use the programmatic `init/sync/runK6`.
3. If the user is hand-editing `loadtest.ts` → show the `defineLoadTest` + `flow()` shape, with the v2 `scenario:` field name.
4. If the user wants parallel HTTP / fan-out → show `flow().batch()` or `Promise.all([api.async.*])`.
5. If the user asks about a specific auth scheme → load `references/auth-recipes.md`.
6. If the user asks about budgets, per-op thresholds, named scenarios, `handleSummary`, or raw-k6 escape hatches → load `references/scenarios-pattern.md`.
