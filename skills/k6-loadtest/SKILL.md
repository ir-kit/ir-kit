---
name: k6-loadtest
description: Load-test an HTTP API with the @ahmedrowaihi/k6 stack — generate a typed k6 client from an OpenAPI spec, scaffold a runnable loadtest.ts, then bundle and spawn k6 programmatically. Use when the user wants to write k6 load tests in TypeScript, perf-test an API from its OpenAPI spec, run smoke/load/stress/spike/soak scenarios, scaffold a starter loadtest, or invoke `k6 run` from a script instead of shelling out. Triggers on "load test", "perf test", "k6", "stress test the API", "spike test", "soak test", "smoke test", `defineLoadTest`, `runK6`, `useAuth`, "k6 scenarios", "k6 budgets", "OpenAPI to k6". Do NOT use for unit tests, integration tests, non-HTTP workloads, or generic Go-based k6 scripting unrelated to the @ahmedrowaihi/k6 framework.
---

# k6 load testing — `@ahmedrowaihi/k6-toolkit`

Generate a typed k6 client from an OpenAPI spec, scaffold a runnable loadtest, then bundle and spawn k6. All programmatic — no shelling out, no `Bun.spawn`, no `npx`.

## When to reach for this

- User has an OpenAPI spec and wants k6 load tests against the API.
- User is writing a perf harness, CI perf gate, or local stress test.
- User asks "how do I load-test endpoint X" / "I need a smoke test" / "spike scenario".
- User mentions `defineLoadTest`, `flow().step()`, `useAuth`, named scenarios, budgets, or pace presets (smoke/load/stress/spike/soak).

Skip this skill for: framework-agnostic k6 scripting, JS-based unit tests, non-HTTP perf work.

## The three packages

| Package | Role |
|---|---|
| `@ahmedrowaihi/k6` | Runtime framework — `defineLoadTest`, `flow`, `useAuth`, pace presets. Imported by the user-written `loadtest.ts`. |
| `@ahmedrowaihi/k6-gen` | Codegen — OpenAPI spec → typed client (`client.ts`, `types.ts`, `data.ts`). Usually consumed transitively. |
| `@ahmedrowaihi/k6-toolkit` | Programmatic API the user calls from scripts. Re-exports `generate` from k6-gen. |

For a brand-new project, the cowpath is **`npm create @ahmedrowaihi/k6`** — interactive wizard that runs `init()`.

## First-run quick start (new project)

```bash
npm create @ahmedrowaihi/k6
```

The wizard asks for:
- Path or URL to the OpenAPI spec
- Output dir for the typed client (default `./src/gen`)
- Auth flavor — `none` / `bearer` / `basic` / `apiKey` / `session`
- Single test or named scenarios
- Whether to emit one stub loadtest per spec operation

Then it generates the client and writes a starter `loadtest.ts` parameterized on the answers. The first param-less GET op in the spec seeds the flow step so the file runs immediately.

## Programmatic equivalent (in a script)

When the user already has a project and wants to drive everything from code:

```ts
import { init, sync, runK6 } from "@ahmedrowaihi/k6-toolkit";

// One-shot scaffold: generates client + writes loadtest.ts
await init({
  input: "./openapi.yaml",      // path, URL, or pre-parsed spec object
  output: "./src/gen",
  auth: "bearer",
  bearerEnv: "API_TOKEN",
  pace: "smoke",
  duration: "30s",
  cwd: __dirname,                // optional; resolves relative paths
});

// Subsequent regens after the spec changes
await sync({
  input: "./openapi.yaml",
  output: "./src/gen",
  reportRenames: true,           // returns diff: { renamed, added, removed }
});

// Bundle + spawn k6 against the loadtest entry
const { exitCode, outfile } = await runK6({
  entry: "./loadtest.ts",
  baseUrl: "https://staging.example.com",
  vus: "50",
  duration: "1m",
  out: ["json=results.json"],    // array, not comma-string
  summary: "./summary.json",
  bundle: {                       // full tsdown UserConfig passthrough
    external: ["https://jslib.k6.io/some-jslib/1.0.0/index.js"],
  },
});
```

`runK6` resolves to `{ exitCode, outfile }`. Signal-killed processes (Ctrl-C, SIGKILL) resolve to `128 + signum` per POSIX so callers can fail-fast on interruption. Errors throw — no swallowed exit codes.

## Writing the loadtest itself

The user-written `loadtest.ts` (whether scaffolded by `init()` or hand-rolled) imports from `@ahmedrowaihi/k6` and the generated client:

```ts
import { defineLoadTest, flow, smoke, useAuth } from "@ahmedrowaihi/k6";
import * as api from "./src/gen/index.js";

const auth = useAuth.bearer({ env: "API_TOKEN" });

const lt = defineLoadTest({
  use: [auth],
  pace: smoke({ duration: "30s" }),
  budgets: { p95: "500ms", errors: "1%" },
  flow: flow()
    .step("list-pets", () => {
      const pets = api.listPets();
      return pets;                              // value flows to next step
    })
    .step("read-first", (pets) => api.getPet(pets[0].id))
    .expect((pet) => pet.id !== undefined),
});

export const options = lt.options;
export default lt.default;
```

`flow().step("name", (ctx) => ...)` chains operations and passes return values down the chain. `.expect(fn)` runs an assertion that fails the iteration if it returns falsy.

For multi-scenario loadtests:

```ts
const lt = defineLoadTest({
  use: [auth],
  scenarios: {
    browse: {
      pace: smoke({ duration: "30s" }),
      flow: flow().step("list", () => api.listPets()),
    },
    write: {
      pace: load({ duration: "1m", vus: 20 }),
      flow: flow().step("create", () => api.addPet(data.Pet())),
      baseUrl: "https://write-replica.example.com",   // per-scenario override
    },
  },
});
```

See [references/auth-recipes.md](references/auth-recipes.md) for the full auth surface (bearer / basic / apiKey / session / custom).
See [references/scenarios-pattern.md](references/scenarios-pattern.md) for budgets, per-op overrides, and the flow/step shape.

## Common pitfalls

- **`out:` is an array, not a comma string.** Programmatic `runK6` takes `out: ["json=a.json", "csv=b.csv"]`, not `"json=a.json,csv=b.csv"`.
- **`cwd` matters when running from a subdirectory.** Pass `cwd: __dirname` if the caller's script lives outside the project root — otherwise relative paths resolve against `process.cwd()`.
- **The generated client uses `T.Pet`-style namespace imports** (`import type * as T from "./types.js"`). User code imports the same way from `./src/gen/index.js`.
- **k6's VM only supports a subset of JS.** Externals (`k6`, `k6/*`) are auto-marked external by the bundler; jslib URLs must be added to `bundle.external` so the loader picks them up at runtime.
- **Signal-killed runs return `128 + signum`.** When the script orchestrator sees a non-zero exitCode, check for signal interruption before treating it as a perf failure.

## How AI agents should use this

1. If the user is starting fresh and just wants to try k6 → suggest `npm create @ahmedrowaihi/k6`.
2. If the user is writing a perf-harness script / CI step → use the programmatic `init/sync/runK6` from `@ahmedrowaihi/k6-toolkit`.
3. If the user is hand-editing their `loadtest.ts` → show the `defineLoadTest` + `flow()` shape, not raw k6 globals.
4. If the user asks about a specific auth scheme → load `references/auth-recipes.md` for the right `useAuth.*` call.
5. If the user asks about budgets, per-op thresholds, or named scenarios → load `references/scenarios-pattern.md`.
