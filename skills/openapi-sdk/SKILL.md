---
name: openapi-sdk
description: Generate idiomatic native SDK clients (Go, Kotlin, Swift, or TypeScript) from an OpenAPI 3.x spec using `@ir-kit/openapi-{go,kotlin,swift,typescript}`. Each generator emits language-native code — Go uses `net/http` + `encoding/json` + `context.Context`, Kotlin uses OkHttp + kotlinx-serialization + suspend, Swift uses Codable + URLSession + async/throws, TypeScript wraps `@hey-api/openapi-ts` with the same `generate({ input, output })` shape. Use when the user wants to ship multi-language SDKs from one spec, generate a client for a specific language, or wire codegen into a build pipeline. Triggers on "Go SDK", "Kotlin client", "Swift SDK", "generate client from OpenAPI", "SDK from spec", "OpenAPI to Go", "OpenAPI to Kotlin", "OpenAPI to Swift", "multi-language SDK". Do NOT use for hey-api plugin authoring (see heyapi-plugin-author) or k6 load testing (see k6-loadtest).
---

# Native SDK codegen — `@ir-kit/openapi-{go,kotlin,swift,typescript}`

One programmatic interface across four target languages. All four expose `generate({ input, output })` with the same input-handling: file path, URL, or pre-parsed object. The three native generators (Go / Kotlin / Swift) default to `normalize: true` and route the spec through a shared safe-normalize preset so OpenAPI 2.0 / 3.0 / 3.1 all produce consistent output. The TypeScript generator is the exception — it forwards to `@hey-api/openapi-ts` which owns its own normalization, so `normalize` defaults to `false` there (pass `normalize: true` to opt into the same pre-pass before hey-api's pipeline).

## Picking the right package

| Language | Package | Output style |
|---|---|---|
| Go | `@ir-kit/openapi-go` | `net/http` + `encoding/json` + `context.Context`. Optional `go.mod`. |
| Kotlin | `@ir-kit/openapi-kotlin` | OkHttp + kotlinx-serialization + `suspend` functions. Optional Gradle wrapper. |
| Swift | `@ir-kit/openapi-swift` | Codable + URLSession + `async throws`. Optional `Package.swift`. |
| TypeScript | `@ir-kit/openapi-typescript` | Thin wrapper over `@hey-api/openapi-ts` (default plugins: `client-fetch` + `typescript` + `sdk`). Plug in any hey-api plugin. |

If the user wants **multiple languages at once**, call `generate` on each in parallel — they're independent.

## Universal shape (Go / Kotlin / Swift)

```ts
import { generate } from "@ir-kit/openapi-go"; // or -kotlin, -swift

await generate({
  input: "./openapi.yaml",       // path, URL, or pre-parsed object
  output: "./sdk/go",            // directory; created if missing
  clean: true,                   // wipe output before writing (default)
  normalize: true,               // apply safe-normalize preset (default)
  // ... language-specific options (see references/per-language.md)
});
```

The result is `{ files: BuiltFile[], output: string }` — file list relative to the output dir.

## TypeScript variant

Wraps `@hey-api/openapi-ts`'s `createClient` so the same workflow targets TS clients via hey-api's full plugin ecosystem (Faker, TanStack Query, oRPC, validators, …):

```ts
import { generate } from "@ir-kit/openapi-typescript";

await generate({
  input: "./openapi.yaml",
  output: "./sdk/ts",
  // Default: ["@hey-api/client-fetch", "@hey-api/typescript", "@hey-api/sdk"]
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    "@hey-api/sdk",
    "@tanstack/react-query",          // hey-api plugin
    "@ir-kit/openapi-ts-faker", // ir-kit plugin
  ],
  heyApi: {                            // pass-through for any hey-api UserConfig field
    parser: { transforms: { enums: "root" } },
  },
});
```

## Spec input — all three shapes work everywhere

`@ir-kit/openapi-tools` ships a `loadSpec()` that every generator calls. Inputs accepted:

- **File path** — `./openapi.yaml`, `./openapi.json`, absolute or relative (resolved against `cwd` if you pass that option).
- **URL** — `https://api.example.com/openapi.yaml` or `http://localhost:8080/spec.json`.
- **Pre-parsed object** — already-loaded JS object (skips fetch + JSON.parse).

The loader auto-detects scheme and routes through `@hey-api/json-schema-ref-parser` for bundling external `$ref`s inline.

## Multi-language driver pattern

A script that generates all four SDKs into one output tree:

```ts
import { generate as go } from "@ir-kit/openapi-go";
import { generate as kotlin } from "@ir-kit/openapi-kotlin";
import { generate as swift } from "@ir-kit/openapi-swift";
import { generate as ts } from "@ir-kit/openapi-typescript";

const input = "./openapi.yaml";

await Promise.all([
  go({     input, output: "./sdks/go",     gomod:   { module: "github.com/example/petstore-sdk" } }),
  kotlin({ input, output: "./sdks/kotlin", gradle:  { artifact: "com.example.petstore" } }),
  swift({  input, output: "./sdks/swift",  package: { name: "PetstoreSDK" } }),
  ts({     input, output: "./sdks/ts" }),
]);
```

This is what `examples/petstore-sdk/` in ir-kit does.

## Language-specific bundling

Each native generator has an optional flag for emitting a package manifest:

- **Go** — `gomod: { module: "..." }` writes `go.mod` at the output root.
- **Kotlin** — `gradle: { artifact: "..." }` writes `build.gradle.kts` + `settings.gradle.kts`.
- **Swift** — `package: true` (sensible defaults) or `{ name, platforms, ... }` writes `Package.swift`.
- **TypeScript** — output is hey-api's existing layout; no extra manifest.

Omit the flag for a "flat source tree" output the user can drop into an existing module/project.

See [references/per-language.md](references/per-language.md) for the full per-language option surface and idiomatic-output examples.

## Common pitfalls

- **`output` is wiped by default** (`clean: true`). Don't point it at a directory containing hand-written files. Pass `clean: false` to merge.
- **Spec 2.0 / 3.0 / 3.1 all work** — `normalize: true` (the default) routes through hey-api's IR so the output shape is identical across input versions.
- **`gomod` / `gradle` / `package` are optional.** Without them, the generator emits only source files — ready for `go mod init`-style consumption in an existing module.
- **TS generator uses hey-api's plugin order matters** — `client-fetch` must come before `sdk`.
- **Authentication is consumer's responsibility.** None of these generators emit auth-aware constructors by default — they emit clients you wire interceptors/headers onto. (TS hey-api plugins like `client-fetch` expose middleware hooks for this.)

## How AI agents should use this

1. Ask the user which language(s) they want — one or many.
2. For 1 language: show the matching `generate({ input, output, … })` snippet from this skill.
3. For multiple languages: show the multi-language driver pattern above.
4. If the user wants language-specific tuning (Go module path, Kotlin Gradle artifact, Swift platforms, TS hey-api plugins) → load `references/per-language.md`.
5. For TypeScript specifically, mention that the user can plug in hey-api's wider ecosystem (TanStack Query, oRPC, validators, Faker) via the `plugins` array.
