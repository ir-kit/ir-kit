import { describe, expect, it } from "vitest";

import { parseSpecOrThrow } from "../../src/asyncapi/parse.ts";

const spec = (schemaFormat: string, schema: string) => `asyncapi: 3.0.0
info:
  title: Formats
  version: 1.0.0
channels:
  users:
    address: users
    messages:
      created:
        payload:
          schemaFormat: ${schemaFormat}
          schema:
${schema}
`;

describe("payload schema formats", () => {
  it("parses Avro payloads", async () => {
    const document = await parseSpecOrThrow({
      kind: "string",
      spec: spec(
        "application/vnd.apache.avro;version=1.9.0",
        `            type: record
            name: User
            fields:
              - name: id
                type: long`,
      ),
    });
    const payload = document.allMessages().all()[0]?.payload();
    expect(payload?.schemaFormat()).toContain("avro");
    expect(payload?.properties()?.id?.type()).toBe("integer");
  });

  it("parses OpenAPI schema object payloads", async () => {
    const document = await parseSpecOrThrow({
      kind: "string",
      spec: spec(
        "application/vnd.oai.openapi;version=3.0.0",
        `            type: object
            properties:
              name:
                type: string
                nullable: true`,
      ),
    });
    const payload = document.allMessages().all()[0]?.payload();
    expect(payload?.properties()?.name?.type()).toEqual(["string", "null"]);
  });
});
