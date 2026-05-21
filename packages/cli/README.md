# `@ir-kit/cli`

The unified `ir` CLI — one entry point for every ir-kit operation across every supported API standard. Commands are JSON-Schema-defined; the runtime auto-derives flags, prompts, help, and validation from the schema.

Part of [ir-kit](https://github.com/ir-kit/ir-kit).

## Install

```sh
npm install -g @ir-kit/cli
# or run ad-hoc:
npx @ir-kit/cli <command>
```

## Commands

```
ir
├── spec
│   ├── convert    Convert between OpenAPI 3 / AsyncAPI 3 / TypeSpec / Protobuf / Postman / JSON Schema
│   └── diff       Cross-family diff with breaking / non-breaking classification
├── docs           Render any spec as standalone HTML via Scalar API Reference
├── sdk
│   ├── go         Generate a Go SDK
│   ├── kotlin     Generate a Kotlin (OkHttp + coroutines) SDK
│   ├── swift      Generate a Swift (URLSession + Codable) SDK
│   ├── typescript Generate a TypeScript SDK via @hey-api/openapi-ts
│   ├── k6         Generate a typed k6 load-test client
│   └── all        Run every SDK generator in one pass
├── recon          Reverse-engineer OpenAPI 3.1 from a HAR capture
├── fn-schema
│   ├── extract    Extract JSON Schemas from TS function signatures
│   ├── scan       Walk the project; report what extractors found
│   ├── inspect    Resolve a single function/identifier and dump its schema
│   └── diff       Compare two extracted bundles
└── k6
    ├── sync       Regenerate a typed k6 client from an OpenAPI spec
    └── bundle     Bundle a k6 loadtest entry into a single .js file
```

Every command supports `--help` for full flag detail.

## Examples

```sh
# Convert between any pair of supported formats — direct or graph-routed.
ir spec convert ./api.proto --to openapi3
ir spec convert ./collection.postman_collection.json --to typespec

# Standalone HTML docs from any input
ir docs ./api.yaml --out docs.html --theme moon

# Cross-family diff — breaking-change detection in CI
ir spec diff ./prod.yaml --after ./staging.proto --failOnBreaking

# Generate every native SDK in one shot
ir sdk all --input ./petstore.yaml --output ./sdks

# Sync a k6 client and bundle the loadtest
ir k6 sync && ir k6 bundle ./loadtest.ts --out dist/loadtest.js
```

## How it works

Each command is a thin schema-driven wrapper around a programmatic `runX()` API exposed by the underlying engine package (`@ir-kit/spec-convert`, `@ir-kit/spec-docs`, `@ir-kit/spec-diff`, `@ir-kit/openapi-{go,kotlin,swift,typescript}`, `@ir-kit/k6-toolkit`, `@ir-kit/fn-schema-core`, `@ir-kit/openapi-recon`). All orchestration lives in those engines — the CLI exists to expose them under one entry point with consistent flag UX.

```ts
// Every command follows the same shape:
export const myCommand: CommandSpec<Input, void> = {
  path: ["spec", "convert"],
  description: "...",
  args: {
    /* JSON Schema */
  },
  handler: async (input) => {
    /* call the engine */
  },
};
```

Programmatic access: import the engine package directly, skip the CLI.
