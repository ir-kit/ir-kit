# petstore example

One [`ir.config.ts`](./ir.config.ts) turns [`fixtures/petstore.yaml`](../../fixtures/petstore.yaml) into Go, Kotlin, Swift, Java, TypeScript and k6 clients, and [`fixtures/user-events.yaml`](../../fixtures/user-events.yaml) into AsyncAPI building blocks.

```sh
pnpm generate   # ir generate: write every target
pnpm check      # ir generate --check, then typecheck the TypeScript, k6 and events code (CI runs this)
```

Generated output is committed, so a generator change shows up as a diff in the PR.

## Layout

| Directory | Generated | Yours |
| --- | --- | --- |
| `go/` | `sdk/` (with `go.mod`) | `example/`: a Go module that depends on `../sdk` through `replace` |
| `kotlin/` | `sdk/` | `example/` plus the Gradle files: `gradle :example:run` |
| `swift/` | `sdk/` (with `Package.swift`) | `example/`: a SwiftPM app, `swift run PetstoreApp` |
| `java/` | `sdk/` | none |
| `typescript/` | `sdk/` | `example/src/main.ts` |
| `k6/` | `gen/` (typed client, faker data, spec snapshot) | `loadtest.ts`, `run.mjs` |
| `events/` | `generated/` (types, topology, event map, dispatch, AMQP bindings) | `producer.ts`, `consumer.ts`, `docker-compose.yml` |

The language examples all cover the same ground against `https://petstore3.swagger.io/api/v3/`: CRUD, bearer and API-key auth, multipart upload, typed errors, per-call options, response headers, response transformers and validators, and request interceptors.

## k6

`k6/loadtest.ts` is the only file you write. It composes four scenarios (`browse`, `write`, `stressTest`, `spikeTest`) from the generated client:

```ts
flow()
  .step("create", () => addPet(data.Pet()))
  .step("read", (pet) => getPetById(pet.id!))
  .step("update", (pet) => updatePet({ ...pet, status: "sold" }))
  .expect((pet) => pet.status === "sold")
  .step("cleanup", (pet) => deletePet(pet.id!));
```

If the spec renames `id`, the next `pnpm generate` makes this line a type error.

```sh
pnpm k6          # every scenario
pnpm k6:load     # or k6:stress, k6:spike: K6_STAGES drives k6's default scenario
```

The public petstore server is flaky on a few endpoints, so the budgets are loose.

## AsyncAPI events

The generator writes building blocks only: no client and no `publish`/`subscribe`. `events/producer.ts` and `events/consumer.ts` wire them to amqplib.

```sh
pnpm broker:up   # RabbitMQ on :5672, management UI on :15672 (guest / guest)
pnpm consumer    # terminal A
pnpm producer    # terminal B
pnpm broker:down
```
