import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseSpecOrThrow } from "../../../src/asyncapi/index.js";
import { asyncapiSchemas } from "../../../src/ir/asyncapi.js";
import {
  eventMap,
  events,
  generate,
  typescript,
} from "../../../src/sdk/asyncapi/index.js";

const SPEC = `asyncapi: 2.6.0
info:
  title: Users
  version: 1.0.0
channels:
  user.created:
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: user.events
          type: topic
          durable: true
          autoDelete: false
        queue:
          name: user-created
          exclusive: false
    subscribe:
      bindings:
        amqp:
          deliveryMode: 2
          priority: 5
          expiration: 60000
          cc:
            - audit
      message:
        name: UserCreated
        payload:
          type: object
          properties:
            id:
              type: string
`;

let dir: string;
let input: string;
let gen: Record<string, string>;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "asyncapi-2-"));
  input = join(dir, "spec.yaml");
  await writeFile(input, SPEC);
  await generate({
    input,
    output: join(dir, "out"),
    plugins: [typescript(), events(), eventMap()],
  });
  gen = {};
  for (const file of ["types.gen.ts", "events.gen.ts", "event-map.gen.ts"]) {
    gen[file] = await readFile(join(dir, "out", file), "utf8");
  }
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("AsyncAPI 2.x", () => {
  it("names a message without a messageId after its name", async () => {
    const doc = await parseSpecOrThrow({ kind: "file", path: input });
    expect([...asyncapiSchemas(doc).messages]).toEqual([
      ["UserCreated", "UserCreatedMessage"],
    ]);
    expect(gen["types.gen.ts"]).toContain("export type UserCreatedMessage = {");
    expect(gen["event-map.gen.ts"]).toContain(
      "UserCreated: UserCreatedMessage;",
    );
    expect(gen["events.gen.ts"]).toContain("userCreated: {");
  });
});

describe("AMQP bindings in Events", () => {
  it("carries the exchange's durable and autoDelete", () => {
    expect(gen["events.gen.ts"]).toMatch(
      /exchangeOptions: \{\s*durable: true,\s*autoDelete: false\s*\}/,
    );
  });

  it("carries the channel's queue", () => {
    expect(gen["events.gen.ts"]).toMatch(
      /queue: \{\s*name: 'user-created',\s*exclusive: false\s*\}/,
    );
  });

  it("carries the operation's publish bindings", () => {
    expect(gen["events.gen.ts"]).toMatch(
      /publishOptions: \{\s*deliveryMode: 2,\s*priority: 5,\s*expiration: 60000,\s*cc: \[\s*'audit'\s*\]\s*\}/,
    );
  });
});

const SHARED_CHANNEL = `asyncapi: 3.0.0
info:
  title: Shared
  version: 1.0.0
channels:
  users:
    address: users.*
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: users
          type: topic
    messages:
      created:
        payload:
          type: object
      deleted:
        payload:
          type: object
operations:
  sendCreated:
    action: send
    channel:
      $ref: '#/channels/users'
    messages:
      - $ref: '#/channels/users/messages/created'
    bindings:
      amqp:
        expiration: 1000
  sendDeleted:
    action: send
    channel:
      $ref: '#/channels/users'
    messages:
      - $ref: '#/channels/users/messages/deleted'
`;

it("takes publish bindings only from operations that send the message", async () => {
  const input = join(dir, "shared.yaml");
  await writeFile(input, SHARED_CHANNEL);
  await generate({
    input,
    output: join(dir, "shared"),
    plugins: [typescript(), events()],
  });
  const source = await readFile(join(dir, "shared/events.gen.ts"), "utf8");
  expect(source).toMatch(
    /created: \{[^}]*publishOptions: \{\s*expiration: 1000/,
  );
  expect(source).toMatch(/deleted: \{[^{}]*\}/);
});
