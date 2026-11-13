---
name: ir-kit
description: Generate SDKs (Go, Kotlin, Swift, Java, TypeScript), k6 load tests, AsyncAPI event code and HTML docs from an OpenAPI, AsyncAPI, TypeSpec, Protobuf or Postman spec with the `ir-kit` package and its `ir` CLI; convert and diff specs; infer OpenAPI from HTTP traffic; extract JSON Schema from TypeScript functions; write Hey API plugins; migrate from the old `@ir-kit/*` packages. Triggers on "ir-kit", "ir generate", "ir.config.ts", "SDK from OpenAPI", "Go/Kotlin/Swift/Java client from spec", "k6 load test from OpenAPI", "AsyncAPI types", "RabbitMQ/AMQP from spec", "convert proto/TypeSpec/Postman to OpenAPI", "breaking changes between specs", "OpenAPI from HAR", "JSON Schema from TypeScript function", "hey-api plugin", "@ir-kit/". Do NOT use for hand-writing API clients without a spec.
---

# ir-kit

One package, `ir-kit`, with the `ir` CLI and every API under subpaths. The only other package is `@ir-kit/k6`, the runtime that runs inside k6. Requires Node 24.

```sh
npm i -D ir-kit
```

Heavy, format-specific libraries are optional peers. When one is missing, the command fails with the exact `npm i -D …` line to run; run it and retry.

## Default workflow: `ir.config.ts` + `ir generate`

Prefer this over one-off `ir sdk` commands whenever the user wants generated code kept in a repo.

```sh
npx ir init --input api/openapi.yaml --targets typescript,go,k6   # writes ir.config.ts
npx ir generate            # write every target
npx ir generate --check    # CI: write nothing, fail listing changed/missing/extra files
npx ir watch               # regenerate on spec or config change
```

```ts
import { defineConfig } from "ir-kit";

export default defineConfig({
  input: "api/openapi.yaml", // OpenAPI 2/3.0/3.1, AsyncAPI, .tsp, .proto, Postman; path or URL
  targets: {
    go: { output: "sdk/go", packageName: "api", gomod: "github.com/me/api-go" },
    kotlin: { output: "sdk/kotlin", packageName: "com.me.api", gradle: true },
    swift: { output: "sdk/swift", swiftPackage: true },
    java: { output: "sdk/java", packageName: "com.me.api", gradle: true },
    typescript: { output: "sdk/ts", plugins: ["faker", "orpc"] },
    k6: { output: "loadtest/gen", defaultBaseUrl: "https://api.example.com" },
    docs: { output: "docs/index.html" },
    asyncapi: { input: "api/events.yaml", output: "src/events" },
  },
});
```

- Paths are relative to the config file. Each target may set its own `input`.
- Unknown targets or options are errors; the option table is in `packages/ir-kit/docs/generate.md`.
- Without `gradle` / `swiftPackage`, Kotlin, Java and Swift output is sources only, meant to be added to an existing project.
- Given an AsyncAPI file, `go`/`kotlin`/`swift`/`java`/`typescript` write one model per message payload. The `asyncapi` target writes TypeScript types, an `Events` const, typed dispatch and amqplib publish/consume helpers.
- Commit the generated output and add `npx ir generate --check` to CI.

From code: `import { generate, loadIrConfig } from "ir-kit/generate"`.

## Other commands

| Task | Command |
| --- | --- |
| One SDK without a config | `ir sdk go\|kotlin\|swift\|java\|typescript\|asyncapi <spec> --output <dir>`; `ir sdk all <spec> --output <dir>` |
| Convert formats | `ir spec convert <spec> --to openapi3\|typespec\|proto\|json-schema\|postman --out <path>` |
| Breaking-change diff | `ir spec diff <before> --after <after> --failOnBreaking` |
| HTML docs (Scalar) | `ir docs <spec> --out docs.html` |
| OpenAPI from traffic | `ir recon <capture.har> --out openapi.json`; in code `ir-kit/recon` takes `Request`/`Response` pairs. The `@ir-kit/glean` DevTools extension captures interactively |
| JSON Schema from TS functions | `ir fn-schema extract --patterns "src/**/*.ts" --bundle schemas.json`; also `scan`, `inspect`, `diff` |
| k6 client + loadtests | `ir k6 sync <spec> --output k6 --scaffold`, then `ir k6 bundle k6/loadtests/<op>.ts --output dist` and `k6 run dist/<op>.mjs` |

`ir <command> --help` lists every flag. Each command wraps an exported function with the same options (`ir-kit/sdk/go` → `generate({ input, output })`, `ir-kit/spec` → `convertSpec`, `diffSpecs`, …).

## k6 load tests

`ir k6 sync` writes a typed client (one function per operation, sync and `http.asyncRequest` variants), types and faker data builders. Loadtests use `@ir-kit/k6`:

```ts
import { defineLoadTest, flow, smoke, useAuth } from "@ir-kit/k6";
import * as api from "./gen/index.ts";

const lt = defineLoadTest({
  use: [useAuth.bearer({ env: "API_TOKEN" })],
  budgets: { p95: 300, errors: 0.01 },
  pace: smoke({ vus: 1, duration: "30s" }), // also load, stress, spike, soak, repro
  flow: flow()
    .step("create", () => api.addPet({ name: "rex", photoUrls: [] }))
    .step("read", (pet) => api.getPetById(pet.id!))
    .expect((pet) => pet.name === "rex"),
});

export const options = lt.options;
export default lt.default;
```

API details: `packages/k6/framework/README.md`. Programmatic bundling and running: `ir-kit/k6-toolkit` (`bundle`, `runK6`).

## Hey API plugins (TypeScript target)

`typescript.plugins` accepts Hey API's own plugins and ir-kit's: `faker` (mock factories), `orpc` (oRPC contract and router), `paths` (per-operation route consts), `typia` (validators; typia 12 or 15, transformed with `ttsc`), `k6`. Their options are in `packages/ir-kit/docs/openapi-ts-*.md`.

To write a new plugin, start from `ir-kit/openapi-ts/kit` (`definePluginConfig`) and copy the closest of `packages/ir-kit/src/openapi-ts/{faker,orpc,paths,typia}`. Plugins emit code with Hey API's `$` TypeScript DSL from `@hey-api/openapi-ts`, not `ts.factory`.

## fn-schema

Reads real TypeScript through the type checker (ts-morph), so generics, aliases and imported types resolve. Besides the CLI: `ir-kit/fn-schema` (`runExtract`), `ir-kit/fn-schema/unplugin` (Vite/webpack/Rollup/esbuild plugin) and `ir-kit/fn-schema/transformer` (replaces `schemaOf(fn)` calls at build time). Config file: `fn-schema.config.ts`.

## Migrating from `@ir-kit/*` packages

Every old package is now a subpath of `ir-kit`. Replace the dependency with `ir-kit` and rewrite imports:

| Old | New |
| --- | --- |
| `@ir-kit/cli` | `ir-kit` (same `ir` binary) |
| `@ir-kit/openapi-{go,java,kotlin,swift,typescript}`, `@ir-kit/compiler-*` | `ir-kit/sdk/{go,java,kotlin,swift,typescript}` |
| `@ir-kit/k6-gen` / `@ir-kit/k6-toolkit` | `ir-kit/sdk/k6` / `ir-kit/k6-toolkit` |
| `@ir-kit/asyncapi-typescript` / `@ir-kit/asyncapi-core` | `ir-kit/sdk/asyncapi` / `ir-kit/asyncapi` |
| `@ir-kit/spec-{loader,convert,diff,docs}` | `ir-kit/spec` |
| `@ir-kit/{openapi,asyncapi,typespec}-loader` | `ir-kit/spec/{openapi,asyncapi,typespec}` |
| `@ir-kit/openapi-ts-{faker,orpc,paths,typia,k6}`, `-plugin-kit` | `ir-kit/openapi-ts/{faker,orpc,paths,typia,k6,kit}` |
| `@ir-kit/fn-schema-core` | `ir-kit/fn-schema` |
| `@ir-kit/fn-schema-{loader,transformer,typescript,unplugin}` | `ir-kit/fn-schema/{loader,transformer,typescript,unplugin}` |
| `@ir-kit/openapi-recon` | `ir-kit/recon` |
| `@ir-kit/{codegen-core,schema,openapi,openapi-tools}` | `ir-kit/{codegen,schema,openapi,openapi-tools}` |
| `@ir-kit/create-k6` | `npx ir init --targets k6` |
| `@ahmedrowaihi/*` (older scope) | same table, after dropping the scope |

`@ir-kit/k6` keeps its name. If the project ran several generators from scripts, replace them with one `ir.config.ts` and `ir generate`. Then build and typecheck the project.
