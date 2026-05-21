# @ir-kit/asyncapi-typescript

AsyncAPI 3.0 → TypeScript generator. Plugin-compose architecture.

Each plugin emits one slice of generated code (types, Events const, dispatch helpers, AMQP helpers, framework adapters). Caller picks which plugins to enable; orchestrator topologically sorts by `dependsOn` and writes via `@hey-api/codegen-core`'s `Project` pipeline.

## Install

```sh
pnpm add -D @ir-kit/asyncapi-typescript
```

Peer deps (most are dev-only at consumer side):

- `@asyncapi/parser` `>=3.0.0`
- `@asyncapi/modelina` `>=5.0.0`
- `@hey-api/codegen-core` `>=0.8.0`
- `@ir-kit/asyncapi-core`, `@ir-kit/asyncapi-core`, `@ir-kit/codegen-core`
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
} from "@ir-kit/asyncapi-typescript";

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

For a full RabbitMQ run (producer + consumer end-to-end), see `examples/asyncapi-events/` in the ir-kit monorepo.

## Built-in plugins

| Plugin | File(s) emitted | Description |
|---|---|---|
| `typescript()` | `types.gen.ts` | TS interfaces from message payload schemas (via `@asyncapi/modelina`). Names taken from spec message ids. |
| `events()` | `events.gen.ts` | `Events` const with `{type, routingKey, exchange, exchangeType, contentType}` per channel/operation, plus an `EventName` type alias |
| `eventMap()` | `event-map.gen.ts` | `EventMap` keyed by event-type literal → message interface, `AnyMessage` union, `isMessageOfType` discriminator |
| `dispatch()` | `dispatch.gen.ts` + `handlers.gen.ts` | Generic `Registry` runtime (with `.on(...)`, `.dispatch`, `.toCallback(...)`, `.bindings`) + spec-bound `handlers()` factory |
| `amqplib()` | `amqp.gen.ts` | `assertExchanges` / `bindAndConsume` / `publish` helpers — pure passthroughs to `amqplib` (no hidden defaults) |
| `indexBarrel()` | `index.gen.ts` | Barrel re-export of every other enabled plugin's surface |

Plugins compose freely. Each plugin's `dependsOn` ensures correct ordering even if the user lists them out of order.

## Authoring custom plugins

```ts
import { definePluginConfig } from "@ir-kit/asyncapi-typescript";

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
    // plugin.emitTs("my.gen.ts", [ts.factory.createXxx(...), ...], { header: "// ..." });
  },
});
```

The `PluginInstance` exposes:

- `plugin.config` — typed resolved config
- `plugin.api` — typed plugin api (other plugins fetch via `plugin.getApi(name)`)
- `plugin.document` — the parsed `AsyncAPIDocumentInterface`
- `plugin.files` — files emitted so far (for plugins like `index-barrel` that inspect prior output)
- `plugin.emit({path, content})` — emit a file as raw text
- `plugin.emitTs(path, statements, {header?})` — emit a file as `ts.Statement[]` (rendered via TypeScript's printer)
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
                  └─ plugin.emitTs(stmts)   → TsStatementNode → Project.files
          └─ project.plan() + project.render()
              ├─ TsStatementRenderer → ts.createPrinter
              └─ RawTextRenderer → concat
          └─ write outputs to disk
```

## Related

- [`actions/asyncapi-regen`](../../actions/asyncapi-regen) — GitHub Action wrapping this generator
- [`@ir-kit/openapi-typescript`](../openapi-typescript) — sister generator for OpenAPI 3.x specs
- [`fixtures/user-events.yaml`](../../fixtures/user-events.yaml) — minimal AsyncAPI 3.0 spec used by tests
