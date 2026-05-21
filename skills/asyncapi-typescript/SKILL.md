---
name: asyncapi-typescript
description: Generate TypeScript types, dispatch helpers, AMQP bindings, and framework adapters from an AsyncAPI 3.0 spec via `@ir-kit/asyncapi-typescript`. Use when the user has an event-driven API, message broker schemas, pub/sub workflows, or wants typed publish/consume code for RabbitMQ / Kafka / NATS. The package uses a plugin-compose architecture — each plugin emits one slice (types, Events const, dispatch helpers, AMQP helpers, barrel) and the orchestrator topologically sorts by `dependsOn`. Triggers on "AsyncAPI", "event types from spec", "AMQP from spec", "RabbitMQ types", "message types", "pub/sub types", "publish/subscribe TypeScript", "event-driven typing". Do NOT use for OpenAPI / HTTP APIs (see openapi-sdk) or k6 load testing.
---

# AsyncAPI 3.0 → TypeScript — `@ir-kit/asyncapi-typescript`

Plugin-compose codegen for AsyncAPI specs. Each plugin emits one slice of generated code; the caller picks which to enable; the orchestrator handles ordering via `dependsOn`.

## When to reach for this

- User has an `asyncapi.yaml` (or `.json`) describing event channels.
- User is wiring producer/consumer code against RabbitMQ / Kafka / NATS / other brokers.
- User wants typed publish/consume helpers — `publish(Event.UserCreated, payload)` over string-builders.
- User is building a dispatch table that routes incoming messages to typed handlers.

## Minimal example

```ts
import {
  generate,
  typescript,
  events,
  eventMap,
  dispatch,
  amqplib,
  indexBarrel,
} from "@ir-kit/asyncapi-typescript";

await generate({
  input: "./asyncapi.yaml",       // path, URL, or parsed AsyncAPIDocumentInterface
  output: "./generated",
  plugins: [
    typescript(),    // types.gen.ts        — payload interfaces (via @asyncapi/modelina)
    events(),        // events.gen.ts       — Events const + EventName type
    eventMap(),      // event-map.gen.ts    — typed message map + isMessageOfType discriminator
    dispatch(),      // dispatch.gen.ts     — Registry runtime + spec-bound handlers() factory
    amqplib(),       // amqp.gen.ts         — assertExchanges / bindAndConsume / publish helpers
    indexBarrel(),   // index.gen.ts        — re-exports the whole surface
  ],
});
```

`plugins` order doesn't matter for correctness — each plugin declares `dependsOn`, the orchestrator topologically sorts. But idiomatic order matches the dependency chain.

## Built-in plugins

| Plugin | File | What it emits | Depends on |
|---|---|---|---|
| `typescript()` | `types.gen.ts` | TS interfaces from message payload schemas (via `@asyncapi/modelina`). | — |
| `events()` | `events.gen.ts` | `Events` const: `{ type, routingKey, exchange, exchangeType, contentType }` per channel × operation. Plus `EventName` type alias. | — |
| `eventMap()` | `event-map.gen.ts` | `EventMap` keyed by event-type literal → message interface. `AnyMessage` union. `isMessageOfType` discriminator. | `typescript`, `events` |
| `dispatch()` | `dispatch.gen.ts` + `handlers.gen.ts` | Generic `Registry` runtime (`.on`, `.dispatch`, `.toCallback`, `.bindings`) + spec-bound `handlers()` factory. | `eventMap`, `events` |
| `amqplib()` | `amqp.gen.ts` | `assertExchanges` / `bindAndConsume` / `publish` — thin pure passthroughs over `amqplib`. | `events` |
| `indexBarrel()` | `index.gen.ts` | Re-exports every other enabled plugin's surface. | runs last |

## End-to-end RabbitMQ shape

After running the generator with all six plugins, consumer code looks like this:

```ts
import { Events, isMessageOfType } from "./generated";
import { handlers } from "./generated/handlers.gen.js";
import { assertExchanges, bindAndConsume, publish } from "./generated/amqp.gen.js";
import amqp from "amqplib";

const conn = await amqp.connect("amqp://localhost");
const ch = await conn.createChannel();
await assertExchanges(ch);

// Publish — typed payload
await publish(ch, Events.UserCreated, { id: "u_1", email: "a@b.c" });

// Consume — typed handler tree
const registry = handlers({
  UserCreated: (msg) => console.log(msg.id, msg.email),   // msg is typed
  OrderPlaced: (msg) => fulfill(msg.orderId),
});
await bindAndConsume(ch, registry.bindings, registry.toCallback());
```

`Events.UserCreated` is `{ type: "UserCreated", routingKey: "...", exchange: "...", ... }` — the literal driven by the spec. `isMessageOfType(msg, Events.UserCreated)` narrows the type for discriminated handling.

## Authoring custom plugins

The plugin shape lets ir-kit consumers extend the generator. Common cases: emitting a NATS adapter, a Kafka adapter, framework-specific bindings (Nest.js, Effect-ts), schema validators.

```ts
import { definePluginConfig } from "@ir-kit/asyncapi-typescript";

export const myPlugin = definePluginConfig<
  "my-plugin",                       // plugin name (literal type)
  { fileName?: string },             // user config
  { fileName: string },              // resolved config
  unknown                            // plugin API exposed to dependents
>({
  name: "my-plugin",
  defaultConfig: { fileName: "my.gen.ts" },
  dependsOn: ["typescript"],
  handler(plugin) {
    for (const ev of plugin.forEach("message")) {
      // ev.message is an AsyncAPI MessageInterface
    }

    plugin.emit({ path: plugin.config.fileName, content: "// ..." });
    // or AST:
    // plugin.emitTs("my.gen.ts", [ts.factory.createXxx(...)], { header: "// ..." });
  },
});
```

The `PluginInstance` surface:

- `plugin.config` — typed resolved config
- `plugin.document` — the parsed `AsyncAPIDocumentInterface`
- `plugin.forEach("message" | "channel" | "operation")` — typed iteration
- `plugin.getApi(name)` — fetch another plugin's exposed API
- `plugin.emit({ path, content })` — raw-text file emission
- `plugin.emitTs(path, statements, opts?)` — `ts.Statement[]` via TS printer (consistent with the rest of the toolchain — no template strings)

## Common pitfalls

- **AMQP plugin is optional.** Don't enable `amqplib()` unless the user is actually using RabbitMQ — adds an `amqplib` peer dep.
- **`@asyncapi/parser` ≥3.0** is a peer requirement. Older versions parse 2.x specs; this generator targets 3.0.
- **Plugin ordering**: `dependsOn` is enforced by the orchestrator, so listing `dispatch()` before `events()` is fine. But for readability, list in dependency order.
- **Custom plugins should emit via `emitTs`** when generating TS code — the project convention is AST-based, no template strings for spec-driven output.
- **`indexBarrel` reads from already-emitted files** — list it last (or rely on `dependsOn`).

## How AI agents should use this

1. Ask which broker / framework the user is using — RabbitMQ vs Kafka vs Nats vs other.
2. For RabbitMQ: show the full plugin set including `amqplib()`.
3. For other brokers: show `typescript()` + `events()` + `eventMap()` + `dispatch()` and tell the user they can either author a broker-specific plugin (see "Authoring custom plugins" above) or wire their own publish/consume layer using `Events` + `EventMap`.
4. For type-only use: `typescript()` + `events()` + `eventMap()` is enough.
5. Point at `examples/asyncapi-events-playground/` in the ir-kit monorepo for an end-to-end RabbitMQ runner.
