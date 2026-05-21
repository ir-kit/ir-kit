# Plugin anatomy — annotated walkthrough

Using `@ir-kit/openapi-ts-paths` as the reference (simplest plugin in ir-kit, ~150 LoC total). Copy this layout for any new plugin.

## File 1: `types.ts` — the contract

Three pieces: user-facing config, resolved config, plugin token + module augmentation.

```ts
import type { Casing, DefinePlugin, NamingRule, Plugin } from "@hey-api/shared";

// What the user passes in their openapi-ts.config.ts
export type UserConfig = Plugin.Hooks &      // hey-api hooks (transform, etc)
  Plugin.UserExports & {                      // hey-api's standard export controls
    name: "@ir-kit/paths";              // plugin identifier — MUST be a string literal
    //                                        // (this can differ from the npm package name —
    //                                        //  npm: `@ir-kit/openapi-ts-paths`,
    //                                        //  plugin: `@ir-kit/paths`. The literal here
    //                                        //  must match the module-augmentation key + any
    //                                        //  `dependencies: ["@ir-kit/paths"]` strings.)
    /** Filename (no extension). @default "paths" */
    output?: string;
    /** Route const naming. */
    naming?: {
      /** @default 'camelCase' */
      casing?: NamingRule | Casing;
      /** @default 'Route' */
      suffix?: string;
    };
  };

// What your handler sees after defaults merge
export type Config = Plugin.Hooks &
  Plugin.Exports & {
    name: "@ir-kit/paths";
    output: string;                            // no `?` — defaults applied
    naming: {
      casing: Casing;
      suffix: string;
    };
  };

// The plugin "token" — combines UserConfig + Config + handler type
export type PathsPlugin = DefinePlugin<UserConfig, Config>;

// CRITICAL: module augmentation registers your plugin in hey-api's map.
// Without this, hey-api can't resolve `dependencies: ["@ir-kit/paths"]`
// elsewhere, and module-augmented import sites won't typecheck.
declare module "@hey-api/openapi-ts" {
  export interface PluginConfigMap {
    "@ir-kit/paths": PathsPlugin;
  }
}
```

**Why the two configs?** `UserConfig` is what the user types (most fields optional). `Config` is what your handler reads (defaults applied). `definePluginConfig` merges them.

## File 2: `config.ts` — defaults + factory

```ts
import { definePluginConfig } from "@hey-api/shared";
import { handler } from "./plugin";
import type { PathsPlugin } from "./types";

export const defaultConfig: PathsPlugin["Config"] = {
  config: {                                    // ← your plugin's user-facing config
    output: "paths",
    naming: {
      casing: "camelCase",
      suffix: "Route",
    },
  },
  dependencies: ["@hey-api/typescript"],       // ← run after @hey-api/typescript
  handler,
  name: "@ir-kit/paths",                 // ← must match the literal in types.ts
  tags: ["transformer"],                       // ← hey-api categorizes plugins by tag
};

export const defineConfig = definePluginConfig(defaultConfig);
```

`definePluginConfig` wraps your defaults and returns a factory the user calls in their `openapi-ts.config.ts`:

```ts
import { defineConfig as paths } from "@ir-kit/openapi-ts-paths";

await createClient({
  // ...
  plugins: [
    "@hey-api/typescript",
    paths({ output: "routes", naming: { suffix: "Path" } }),
  ],
});
```

The user-provided object gets merged with `defaultConfig.config`. The merged result lands on `plugin.config` in your handler.

## File 3: `plugin.ts` — the handler

```ts
import { $ } from "@hey-api/openapi-ts";
import type { PathsPlugin } from "./types";

export const handler: PathsPlugin["Handler"] = ({ plugin }) => {
  // 1. Register a file the user will receive
  const file = plugin.createFile({
    id: plugin.name,                           // unique within the plugin pipeline
    path: plugin.config.output,                // filename hey-api will write
  });

  // 2. Walk the IR — hey-api gives you typed iteration
  plugin.forEach("operation", (event) => {
    const { operation } = event;
    // operation.id, operation.method, operation.path, operation.parameters, ...

    const constName = nameFromOperation(
      operation.id,
      plugin.config.naming.casing,
      plugin.config.naming.suffix,
    );

    // 3. Emit AST nodes — use $ DSL for expressions/decls, ts.factory for imports/interfaces
    file.add(
      $.const(constName)
        .export()
        .assign(
          $.object()
            .prop("method", $.literal(operation.method))
            .prop("path", $.literal(operation.path)),
        ),
    );
  });
};

function nameFromOperation(opId: string, casing: string, suffix: string): string {
  // ... case conversion using @hey-api/shared's casing utils
}
```

**Key contract**:

- `plugin.config` — typed, defaults applied
- `plugin.context` — global pipeline state (rarely needed directly)
- `plugin.createFile({ id, path })` — registers an output file
- `plugin.forEach(kind, fn)` — iterate IR items (`"operation"` / `"schema"` / etc)
- `plugin.getApi(name)` — fetch another plugin's exposed API (for cross-plugin coordination)
- `file.add(node)` — push a TS DSL node into the file's emit list

## File 4: `index.ts` — the barrel

```ts
import "./types";                              // side-effect import — triggers module augmentation
export { defaultConfig, defineConfig } from "./config";
export type { PathsPlugin } from "./types";
```

The bare `import "./types"` is critical — it ensures the `declare module "@hey-api/openapi-ts"` block in `types.ts` runs when consumers import your package. Without it, hey-api's PluginConfigMap doesn't know about your plugin and `dependencies` references won't resolve.

## package.json shape

```jsonc
{
  "name": "@my-org/my-plugin",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "@hey-api/openapi-ts": ">=0.95.0",
    "@hey-api/shared": ">=0.3.0"
  },
  "devDependencies": {
    "@hey-api/openapi-ts": "catalog:",
    "@hey-api/shared": "catalog:"
  }
}
```

Peer-deps `@hey-api/openapi-ts` + `@hey-api/shared` — both must be available at the consumer site. devDeps for local typecheck/build.

## Build pipeline

Per ir-kit convention:

```jsonc
"scripts": {
  "build": "tsc -p tsconfig.build.json",
  "typecheck": "tsc --noEmit",
  "test": "vitest run --passWithNoTests"
}
```

Two tsconfigs: `tsconfig.json` for IDE/typecheck (`noEmit`, includes `tests/`), `tsconfig.build.json` for emit (excludes `tests/`, sets `outDir: dist`).

## When to add a plugin to the ir-kit repo

If your plugin is useful to other ir-kit consumers and tracks the workspace's quality bar (manypkg-aligned versions, biome formatting, vitest coverage), open a PR adding it under `packages/openapi/plugins/<name>/`. Maintainer will route it.

If it's domain-specific to your team, ship it from your own repo with the four-file shape above. It composes with ir-kit plugins without modification.
