---
name: heyapi-plugin-author
description: Write a `@hey-api/openapi-ts` plugin that emits custom codegen on top of hey-api's IR. Use when the user wants to add a TypeScript code generator that hooks into hey-api's spec → IR pipeline — custom validators, mock factories, RPC clients, route maps, framework adapters, anything hey-api doesn't ship. The contract-kit repo already has five reference plugins (`openapi-ts-faker`, `openapi-ts-orpc`, `openapi-ts-paths`, `openapi-ts-typia`, `openapi-ts-k6`) that serve as templates. Triggers on "hey-api plugin", "openapi-ts plugin", "custom codegen plugin", "extend hey-api", `definePluginConfig`, `definePlugin`, "openapi-ts hooks", "openapi-ts plugin author". Do NOT use for hey-api consumption (use openapi-sdk → `@ahmedrowaihi/openapi-typescript`) or for non-hey-api codegen (see openapi-sdk for go/kotlin/swift, asyncapi-typescript for AsyncAPI).
---

# Authoring a `@hey-api/openapi-ts` plugin

hey-api's plugin model lets you drop a new code generator into the spec → IR → emit pipeline. Five reference plugins live in this monorepo at `packages/openapi/plugins/` (`faker`, `orpc`, `paths`, `typia`) and at `packages/k6/hey-api/` (`openapi-ts-k6`). Copy whichever has the closest shape to your target.

## When to reach for this

- User wants codegen that hey-api doesn't ship — faker factories, oRPC clients, route consts, typia validators, k6 clients, RPC clients for a different framework.
- User wants to compose with existing hey-api plugins (`@hey-api/typescript`, `@hey-api/sdk`) — depend on them via `dependencies` so the order is right.
- User is extending an existing plugin and wants the canonical shape.

Skip this skill for: consuming hey-api (the user just wants `generate({ input, output })` → see `openapi-sdk`), or non-hey-api codegen.

## Plugin anatomy

Every hey-api plugin is **four files**:

```
my-plugin/
├── src/
│   ├── index.ts        # exports defineConfig + types (the public surface)
│   ├── config.ts       # defaultConfig + the definePluginConfig wrapper
│   ├── plugin.ts       # handler() — the actual codegen logic
│   └── types.ts        # UserConfig + Config + module augmentation
└── package.json
```

See [references/plugin-anatomy.md](references/plugin-anatomy.md) for the full walkthrough of each file using `@ahmedrowaihi/openapi-ts-paths` (the simplest reference plugin — 4 files, ~150 lines total).

## Minimal plugin

### `types.ts`

```ts
import type { DefinePlugin, Plugin } from "@hey-api/shared";

export type UserConfig = Plugin.Hooks &
  Plugin.UserExports & {
    name: "@my-org/my-plugin";
    /** Filename (no extension). @default "my-output" */
    output?: string;
  };

export type Config = Plugin.Hooks &
  Plugin.Exports & {
    name: "@my-org/my-plugin";
    output: string;
  };

export type MyPlugin = DefinePlugin<UserConfig, Config>;

// Module augmentation — registers your plugin in hey-api's plugin map
declare module "@hey-api/openapi-ts" {
  export interface PluginConfigMap {
    "@my-org/my-plugin": MyPlugin;
  }
}
```

### `config.ts`

```ts
import { definePluginConfig } from "@hey-api/shared";
import { handler } from "./plugin.js";
import type { MyPlugin } from "./types.js";

export const defaultConfig: MyPlugin["Config"] = {
  config: { output: "my-output" },
  dependencies: ["@hey-api/typescript"],   // depend on TS plugin so types resolve
  handler,
  name: "@my-org/my-plugin",
  tags: ["transformer"],
};

export const defineConfig = definePluginConfig(defaultConfig);
```

### `plugin.ts` — the codegen handler

```ts
import type { MyPlugin } from "./types.js";

export const handler: MyPlugin["Handler"] = ({ plugin }) => {
  // plugin.context — global pipeline context
  // plugin.config  — your resolved config (filled in by definePluginConfig)
  // plugin.file({...}) — register a file to emit
  // plugin.forEach("operation", (event) => ...) — iterate ops
  // plugin.forEach("schema", (event) => ...) — iterate schemas

  const file = plugin.createFile({
    id: plugin.name,
    path: plugin.config.output,
  });

  plugin.forEach("operation", (event) => {
    // event.operation has: id, method, path, parameters, body, responses
    file.add(/* TsDsl node */);
  });
};
```

### `index.ts`

```ts
import "./types.js";   // side-effect import for module augmentation

export { defaultConfig, defineConfig } from "./config.js";
export type { MyPlugin } from "./types.js";
```

## Reference plugins — copy these

The contract-kit monorepo ships five plugins. Each demonstrates a different pattern:

| Plugin | Pattern | LoC |
|---|---|---|
| [`@ahmedrowaihi/openapi-ts-paths`](https://github.com/ahmedrowaihi/contract-kit/tree/main/packages/openapi/plugins/paths) | Simplest — per-operation route consts. Best starting point. | ~150 |
| [`@ahmedrowaihi/openapi-ts-faker`](https://github.com/ahmedrowaihi/contract-kit/tree/main/packages/openapi/plugins/faker) | Schema-driven — emits faker factories per top-level schema. Shows schema iteration. | ~600 |
| [`@ahmedrowaihi/openapi-ts-typia`](https://github.com/ahmedrowaihi/contract-kit/tree/main/packages/openapi/plugins/typia) | Validator emission — types → typia validators. Shows IR walking + format hints. | ~400 |
| [`@ahmedrowaihi/openapi-ts-orpc`](https://github.com/ahmedrowaihi/contract-kit/tree/main/packages/openapi/plugins/orpc) | Multi-file emission — oRPC clients + contract + server. Largest of the set. | ~800 |
| [`@ahmedrowaihi/openapi-ts-k6`](https://github.com/ahmedrowaihi/contract-kit/tree/main/packages/k6/hey-api) | Thin delegator — defers all real work to `@ahmedrowaihi/k6-gen`. Shows "plugin as adapter". | ~30 |

**Start with `openapi-ts-paths`** if you're new — smallest surface, complete shape.

## How hey-api wires your plugin

When a consumer does:

```ts
import { defineConfig as myPlugin } from "@my-org/my-plugin";

await createClient({
  input: "./openapi.yaml",
  output: "./client",
  plugins: ["@hey-api/typescript", "@hey-api/sdk", myPlugin({ output: "routes" })],
});
```

…hey-api:

1. Parses the spec into an IR (`ir.paths`, `ir.components.schemas`, …).
2. Resolves the plugin order via `dependencies` (`@hey-api/typescript` runs before yours).
3. Calls each plugin's `handler({ plugin })`.
4. The handler emits files via `plugin.createFile(...).add(...)`.
5. hey-api writes everything to disk + runs format/lint passes.

Your plugin doesn't write to disk directly — it registers nodes via the DSL or `createFile`.

## The IR you'll be walking

hey-api's IR is documented in `@hey-api/shared`'s exported types. The shapes you'll touch most:

- `IR.OperationObject` — `id`, `method`, `path`, `parameters: { path?, query?, header?, cookie? }`, `body?`, `responses`
- `IR.SchemaObject` — type-tagged union (`string`, `number`, `enum`, `object`, `array`, `tuple`, plus composed shapes with `items`). The contract-kit repo has `@ahmedrowaihi/openapi-tools` with helpers — `getEnumLiterals`, `isEnumSchema`, `isUnionSchema` — that handle the common dispatch traps.

## Code generation: use `$` DSL or `ts.factory`

Convention across contract-kit: **no template strings for spec-driven generation**. Use hey-api's `$` DSL (`import { $ } from "@hey-api/openapi-ts"`) or `ts.factory` directly. The DSL has gaps (no `$.import`, no `$.interface`, no statement-level `$.raw`), so import declarations and interface declarations drop to `ts.factory` directly via small helpers.

See `packages/k6/codegen/src/emit/ast-imports.ts` in the repo for a reusable `namedImport` / `namespaceImport` helper pair.

## Common pitfalls

- **Plugin name must be a string literal** (e.g. `"@my-org/my-plugin"`), used in the module augmentation, in the `name` field, and as the dependency string. Mismatch → silent skip.
- **`dependencies` are plugin names, not npm package names.** They reference hey-api plugins by their `name` field.
- **Module augmentation must run.** That's why `index.ts` does `import "./types.js"` for side effects — it triggers the `declare module "@hey-api/openapi-ts"` augmentation. Without it, hey-api doesn't know about your plugin.
- **Emit through `plugin.createFile`, not direct `fs`.** hey-api owns disk writes; your handler stays pure.
- **Walk via `plugin.forEach("operation" | "schema", ...)`**, not by traversing `ir.paths` directly — the helper does the path-method-method canonicalization for you.

## How AI agents should use this

1. Ask which kind of plugin: types-only / schema-driven / validators / multi-file / framework adapter.
2. Match to the closest reference plugin and tell the user to copy that as a template.
3. Load [references/plugin-anatomy.md](references/plugin-anatomy.md) when they need the four-file shape explained line-by-line.
4. For DSL questions ("how do I emit an interface", "how do I emit an import"), point at `packages/k6/codegen/src/emit/ast-imports.ts` in the repo for the AST helper pattern.
5. For IR walking, point at `@ahmedrowaihi/openapi-tools` (specifically `getEnumLiterals` / `isEnumSchema` / `isUnionSchema`) — the schema-dispatch helpers shared across all contract-kit generators.
