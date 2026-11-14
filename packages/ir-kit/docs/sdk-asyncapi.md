# @ir-kit/kit/sdk/asyncapi

AsyncAPI 3.0 → TypeScript generator. Plugin-compose architecture.

Each plugin emits one slice of generated code (types, Events const, dispatch helpers, AMQP helpers, framework adapters). Caller picks which plugins to enable; orchestrator topologically sorts by `dependsOn` and writes via `@hey-api/codegen-core`'s `Project` pipeline.

## Install

```sh
pnpm add -D @ir-kit/kit
```

Peer deps (most are dev-only at consumer side):

- `@asyncapi/parser` `>=3.0.0`
- `@hey-api/openapi-ts` `>=0.99.0`
- `@hey-api/codegen-core` `>=0.8.0`
- `@ir-kit/kit/asyncapi`, `@ir-kit/kit/asyncapi`, `@ir-kit/kit/codegen`
- `typescript` `>=5.0.0`
- `amqplib` `>=0.10.0` *(optional — only if you enable the `amqplib` plugin)*

## Usage

```ts
import {
  amqplib,
  dispatch,
  eventMap,
  events,
  generate,
  indexBarrel,
  typescript,
} from "@ir-kit/kit/sdk/asyncapi";

await generate({
  input: "./asyncapi.yaml",
  output: "./generated",
  plugins: [
    typescript(),
    events(),
    eventMap(),
    dispatch(),
    amqplib(),
    indexBarrel(),
  ],
});
```

For a full RabbitMQ run (producer + consumer end-to-end), see `examples/petstore/events/` in the ir-kit monorepo.

## Built-in plugins

| Plugin | File(s) emitted | Description |
|---|---|---|
| `typescript()` | `types.gen.ts` | TS types from message payload and component schemas (via `@hey-api/openapi-ts`). Names taken from spec message ids and component names. |
| `events()` | `events.gen.ts` | `Events` const with `{type, routingKey, exchange, exchangeType, contentType}` per channel/operation, plus the AMQP bindings the spec sets (`exchangeOptions`, `queue`, `publishOptions`), and an `EventName` type alias |
| `eventMap()` | `event-map.gen.ts` | `EventMap` keyed by event-type literal → message interface, `AnyMessage` union, `isMessageOfType` discriminator |
| `dispatch()` | `dispatch.gen.ts` + `handlers.gen.ts` | Generic `Registry` runtime (with `.on(...)`, `.dispatch`, `.toCallback(...)`, `.bindings`) + spec-bound `handlers()` factory |
| `amqplib()` | `amqp.gen.ts` | `assertExchanges` / `bindAndConsume` / `publish` helpers over `amqplib`. They apply the spec's bindings from `Events`; options you pass override them |
| `indexBarrel()` | `index.gen.ts` | Barrel re-export of every other enabled plugin's surface |

Plugins compose freely. Each plugin's `dependsOn` ensures correct ordering even if the user lists them out of order.

## Authoring custom plugins

```ts
import { definePluginConfig } from "@ir-kit/kit/sdk/asyncapi";

export const myPlugin = definePluginConfig<
  "my-plugin",
  { fileName?: string },
  { fileName: string },
  unknown
>({
  name: "my-plugin",
  defaultConfig: { fileName: "my.gen.ts" },
  dependsOn: ["typescript"], // run after the typescript plugin
  handler(plugin) {
    for (const ev of plugin.forEach("message")) {
      if (ev.type !== "message") continue;
      // ...inspect ev.message...
    }
    plugin.emit({
      path: plugin.config.fileName,
      content: "// my custom code\n",
    });
    // or, for AST emission:
    // plugin.emitTs("my.gen.ts", [$.const("x").export().assign($.literal(1))], { header: "// ..." });
  },
});
```

The `PluginInstance` exposes:

- `plugin.config` — typed resolved config
- `plugin.api` — typed plugin api (other plugins fetch via `plugin.getApi(name)`)
- `plugin.document` — the parsed `AsyncAPIDocumentInterface`
- `plugin.files` — files emitted so far (for plugins like `index-barrel` that inspect prior output)
- `plugin.emit({path, content})` — emit a file as raw text
- `plugin.emitTs(path, nodes, {header?, imports?, exports?})` — emit a file built with Hey API's `$` DSL (`import { $ } from "@hey-api/openapi-ts"`), rendered by Hey API's TypeScript renderer; a string is printed as-is after the nodes
- `plugin.getApi<T>(name)` — fetch another plugin's exposed api
- `plugin.forEach('message' | 'channel' | 'operation', ...)` — iterate spec entities

## How the pipeline works

```
asyncapi.yaml
  └─ @asyncapi/parser → AsyncAPIDocumentInterface
      └─ orchestrator (topological sort by dependsOn)
          └─ for each plugin:
                handler(PluginInstance)
                  ├─ plugin.emit(rawText)   → RawTextNode → Project.files
                  └─ plugin.emitTs(nodes)   → TsStatementNode → Project.files
          └─ project.plan() + project.render()
              ├─ TsStatementRenderer → ts.createPrinter
              └─ RawTextRenderer → concat
          └─ write outputs to disk
```

## Related

- [`ir generate`](./generate.md): the `asyncapi` target runs this generator from `ir.config.ts`
- [`@ir-kit/kit/sdk/typescript`](../openapi-typescript) — sister generator for OpenAPI 3.x specs
- [`fixtures/user-events.yaml`](../../fixtures/user-events.yaml) — minimal AsyncAPI 3.0 spec used by tests
