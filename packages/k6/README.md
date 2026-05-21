# k6 load-testing track

Four packages that together give you typed, spec-driven [k6](https://k6.io) load tests with zero hand-rolled boilerplate.

```
@ir-kit/k6           Framework — defineLoadTest, flow().step() chaining,
                           pace presets, budgets, useAuth middleware.
                           This is the only package you import from your loadtest.ts.

@ir-kit/k6-gen       Standalone generator — spec in, typed client + data
                           builders out. Mirrors openapi/swift, openapi/go, openapi/kotlin.
                           Has no hey-api dependency at the call site.

@ir-kit/k6-tools     CLI: k6-tools init, sync, run. Wraps the generator,
                           bundles loadtest.ts via esbuild, shells out to the real
                           k6 binary.

@ir-kit/openapi-ts-k6  Optional thin @hey-api/openapi-ts plugin wrapping the
                             generator. Use only if you already drive codegen
                             through openapi-ts.config.ts.
```

## What it gives you

```ts
import { defineLoadTest, flow, smoke, load, useAuth } from "@ir-kit/k6";
import { addPet, getPetById, deletePet } from "./gen/client.js";
import { data } from "./gen/data.js";

const lt = defineLoadTest({
  use: [useAuth.bearer({ env: "API_TOKEN" })],
  budgets: {
    p95: "500ms",
    errors: "1%",
    ops: { getPetById: { p95: "100ms" } },
  },
  scenarios: {
    browse: {
      pace: smoke({ vus: 5, duration: "1m" }),
      flow: flow().step(() => getPetById(1)),
    },
    write: {
      pace: load({ target: 50, hold: "2m" }),
      flow: flow()
        .step("create", () => addPet(data.Pet())) // returns Pet
        .step("read", (pet) => getPetById(pet.id!)) // pet.id typed as number
        .step("cleanup", (pet) => deletePet(pet.id!)),
    },
  },
});

export const options = lt.options;
export default lt.default;
export const { browse, write } = lt.scenarios;
```

- **Typed across requests** — step output flows into the next step with full inference, no `.json("id")` casts.
- **Spec drift = compile error** — regenerate the client via `k6-tools sync`; TypeScript points at every broken call site.
- **Flat budgets** — write `p95: "500ms"`, not `'http_req_duration': ['p(95)<500']`. Per-op overrides via `ops.<id>`.
- **Realistic payloads** — `data.<TypeName>()` returns a typed, faker-backed body from the schema. Override fields with the optional `overrides` arg.
- **Auth in one line** — `useAuth.bearer/basic/apiKey/custom` injects headers into every generated call.

## Getting started

```bash
pnpm add -D @ir-kit/k6-tools
pnpm add @ir-kit/k6

# scaffold
pnpm k6-tools init --spec ./openapi.yaml

# edit loadtest.ts, then
pnpm k6-tools run
```

See [examples/k6-petstore](../../examples/k6-petstore/) for a full working setup.
