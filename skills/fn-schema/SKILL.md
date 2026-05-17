---
name: fn-schema
description: Extract JSON Schema (Draft 2020-12) for TypeScript function inputs and outputs from real source code, using `@ahmedrowaihi/fn-schema-cli` or its underlying lib `@ahmedrowaihi/fn-schema-core`. Use when the user wants `schemaOf(fn)` at build time, JSON Schemas derived from existing TS function signatures (without rewriting types to Zod/Yup/etc), per-function schema files, a bundled schemas.json, or OpenAPI 3.1 `components.schemas` fragments. Pairs with the `@ahmedrowaihi/fn-schema-transformer` TS compiler-API transformer for inline-at-emit replacement of `schemaOf(myFn)` calls. Triggers on "JSON Schema from TypeScript", "function signature to schema", "schemaOf", "extract schema from TS function", "schemas from existing code", "schemas without rewriting types", "fn-schema". Do NOT use for OpenAPI codegen (see openapi-sdk) or schema authoring (see hey-api plugins / typia).
---

# fn-schema — JSON Schema from TS function signatures

Walk TS source, find functions, emit JSON Schema (Draft 2020-12) for each function's input and output. Pure extraction — no runtime, no decorators, no rewriting your types.

## When to reach for this

- User has existing typed functions (or service handlers, RPC endpoints, controller methods) and wants schemas for them — for validation, OpenAPI docs, or AI tool calling — without adopting a separate schema library.
- User wants `schemaOf(fn)` to inline at build time (the transformer flow).
- User needs OpenAPI 3.1 `components.schemas` fragments derived from TS handlers.
- User is comparing two bundles to detect breaking changes (`diff` command).

## Quick start — CLI

```bash
pnpm add -D @ahmedrowaihi/fn-schema-cli
```

```bash
# Per-signature JSON files
npx fn-schema extract 'src/**/*.ts' --out generated --pretty

# Single bundled JSON
npx fn-schema extract 'src/**/*.ts' --bundle generated/schemas.json --pretty

# Bundle + typed TS wrapper for the loader package
npx fn-schema extract 'src/**/*.ts' --bundle generated/schemas.json --bundle-types --pretty

# OpenAPI 3.1 components fragment
npx fn-schema extract 'src/**/*.ts' --openapi generated/openapi.json --pretty
```

`'src/**/*.ts'` is a glob. The CLI uses tinyglobby — quote it so the shell doesn't expand.

## Watch mode (dev loops)

```bash
npx fn-schema extract 'src/api/**/*.ts' --bundle generated/schemas.json --bundle-types --watch
```

Keeps a warm `Project` between rebuilds → tens-of-milliseconds re-extract on file change.

## Subcommand cheat sheet

| Command | Purpose |
|---|---|
| `extract <glob>` | Generate per-file JSON, a bundle, or OpenAPI. The main command. |
| `scan <glob>` | Read-only function listing — fast, no schemas. Pipe `--json` to other tools. |
| `inspect <fn> <glob>` | Resolved input/output for one function. Verify mappings without writing the bundle. |
| `browse <glob>` | Interactive picker (clack). Pick functions, then choose an action: print / bundle / per-file / OpenAPI. |
| `diff <old> <new>` | Compare two bundles. `--breaking-only` exits 1 only on removed/changed shapes — CI gate. |

## Programmatic use

```ts
import { extract } from "@ahmedrowaihi/fn-schema-typescript";
import { emitBundle, emitFiles, emitOpenAPI } from "@ahmedrowaihi/fn-schema-core";

const result = await extract({
  patterns: ["src/**/*.ts"],
  // tsConfigPath: "./tsconfig.json",  // auto-resolved if omitted
});

// Choose your emitter:
await emitBundle(result, { outFile: "schemas.json", pretty: true, types: true });
// or
await emitFiles(result, { outDir: "generated", pretty: true });
// or
await emitOpenAPI(result, { outFile: "openapi.json" });
```

## The transformer (compile-time inlining)

`@ahmedrowaihi/fn-schema-transformer` is a TypeScript compiler-API transformer that replaces `schemaOf(myFunction)` calls with the literal JSON Schema at build time. Eliminates the runtime extraction cost.

```ts
// Before transformer:
const schema = schemaOf(createUser);    // → throws at runtime (no impl)

// After transformer (build output):
const schema = { type: "object", properties: { name: { type: "string" }, ... } };
```

Plug into ts-patch, swc, esbuild, or any tool that accepts a custom TS transformer. See `@ahmedrowaihi/fn-schema-transformer`'s README for build-chain wiring.

## Vendor-extension keywords (advanced)

```bash
npx fn-schema extract 'src/**/*.ts' --bundle schemas.json \
  --identity x-fn-schema-ts \
  --transport x-fn-schema-transport \
  --source-locations x-fn-schema-source
```

| Flag | Attached to | Use case |
|---|---|---|
| `--identity` | mapped + named-type schemas | nominal-type matching across functions (same TS type → same schema $id) |
| `--transport` | binary-shaped schemas | frontend picks `multipart` vs `base64` from the same TS signature |
| `--source-locations` | named definitions | navigation + drift detection |

Off by default. Pass `""` or `false` to explicitly disable when a config file would otherwise enable.

## Config file (optional)

`fn-schema.config.{ts,js,json}` at the repo root, loaded via c12. All CLI flags map 1:1:

```ts
import { defineConfig } from "@ahmedrowaihi/fn-schema-cli";

export default defineConfig({
  patterns: ["src/api/**/*.ts"],
  bundle: "generated/schemas.json",
  bundleTypes: true,
  pretty: true,
  identity: "x-fn-schema-ts",
});
```

## Common pitfalls

- **Globs must be quoted** in the shell — `'src/**/*.ts'` not `src/**/*.ts`. Otherwise the shell expands and you get one ts file.
- **Functions must be exported** (or at least reachable from a tsconfig root) for the extractor to find them. Internal-only helpers are skipped.
- **Implicit `any` becomes `{}` in JSON Schema** — fix in the TS source, not the schema.
- **The transformer needs your build chain to load it.** ts-patch is the easiest path for tsc users; for swc/esbuild check the transformer's README.
- **`schemaOf` is build-time only.** Calling it without the transformer throws — keep that in mind when writing fallback code paths.

## How AI agents should use this

1. If the user just wants schemas in their hand → use `fn-schema extract` CLI with `--bundle` or `--out`.
2. If they want OpenAPI components → `fn-schema extract --openapi`.
3. If they want schemas inlined at build time → set up the transformer in their build chain.
4. If they want to gate CI on breaking schema changes → `fn-schema diff old.json new.json --breaking-only`.
5. If they want to discover what's extractable before committing → `fn-schema scan` or `fn-schema browse`.
