import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { eventMap, generate, typescript } from "../src/index.js";

const SPEC = `asyncapi: 3.0.0
info:
  title: Names
  version: 1.0.0
channels:
  lights:
    address: lights
    messages:
      turnOn:
        name: turnOn
        payload:
          type: object
          properties:
            on:
              type: boolean
      ping:
        name: ping
      heartbeat:
        name: heartbeat
        payload:
          type: string
          enum:
            - "\\r\\n"
      userCreated:
        name: userCreated
        payload:
          schemaFormat: application/vnd.apache.avro;version=1.9.0
          schema:
            type: record
            name: User
            fields:
              - name: id
                type: long
operations:
  send:
    action: send
    channel:
      $ref: '#/channels/lights'
`;

let dir: string;
let eventMapSource: string;
let typesSource: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "asyncapi-names-"));
  const input = join(dir, "spec.yaml");
  await writeFile(input, SPEC);
  await generate({
    input,
    output: join(dir, "out"),
    plugins: [typescript(), eventMap()],
  });
  eventMapSource = await readFile(join(dir, "out/event-map.gen.ts"), "utf8");
  typesSource = await readFile(join(dir, "out/types.gen.ts"), "utf8");
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("message type names", () => {
  it("imports the name Hey API generated for camelCase message ids", () => {
    expect(typesSource).toContain("export type TurnOnMessage = {");
    expect(eventMapSource).toContain("TurnOnMessage");
    expect(eventMapSource).not.toContain("turnOnMessage");
  });

  it("generates types for Avro payloads", () => {
    expect(typesSource).toMatch(
      /export type UserCreatedMessage = \{[^}]*id: number/,
    );
  });

  it("escapes string enum values", () => {
    expect(typesSource).toContain("export type HeartbeatMessage = '\\r\\n';");
  });

  it("maps messages without a payload to unknown", () => {
    expect(eventMapSource).toMatch(/ping: unknown/);
    expect(eventMapSource).toContain("?.type === type");
  });
});
