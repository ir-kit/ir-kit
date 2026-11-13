import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { convertSpec } from "../../../src/spec/convert/index.js";
import { findConverterPath } from "../../../src/spec/convert/registry.js";

const fixtures = join(import.meta.dirname, "fixtures");
let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "spec-convert-"));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("convertSpec", () => {
  it("rejects input that is not an API spec", async () => {
    const path = join(dir, "package.json");
    await writeFile(path, '{ "name": "pkg" }');
    await expect(convertSpec({ input: path, to: "openapi3" })).rejects.toThrow(
      "Unrecognized spec",
    );
  });

  it("detects a Postman collection by content, not file name", async () => {
    const path = join(dir, "collection.json");
    await writeFile(
      path,
      JSON.stringify({
        info: {
          name: "c",
          schema:
            "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        item: [],
      }),
    );
    const result = await convertSpec({ input: path, to: "openapi3" });
    expect(result.from).toBe("postman");
  });

  it("passes a Postman collection through when the target is postman", async () => {
    const path = join(dir, "collection.json");
    const result = await convertSpec({ input: path, to: "postman" });
    expect(result.output).toMatchObject({
      kind: "document",
      document: { info: { name: "c" } },
    });
  });

  it("converts proto to OpenAPI", async () => {
    const result = await convertSpec({
      input: join(fixtures, "petstore.proto"),
      to: "openapi3",
    });
    expect(result.output.kind).toBe("document");
  });

  it("points every proto $ref at a schema it emits, package and imports included", async () => {
    const input = join(dir, "shop.proto");
    await writeFile(
      input,
      [
        'syntax = "proto3";',
        "package shop.v1;",
        'import "google/protobuf/timestamp.proto";',
        'import "google/protobuf/empty.proto";',
        "enum Status { STATUS_UNSPECIFIED = 0; ACTIVE = 1; }",
        "message Order { Status status = 1; google.protobuf.Timestamp placed_at = 2; repeated Item items = 3; }",
        "message Item { string sku = 1; }",
        "service Orders { rpc Get(google.protobuf.Empty) returns (Order); }",
      ].join("\n"),
    );
    const result = await convertSpec({ input, to: "openapi3" });
    if (result.output.kind !== "document") throw new Error("expected document");
    const doc = result.output.document as {
      components: { schemas: Record<string, { properties?: object }> };
    };
    const refs =
      JSON.stringify(doc).match(/#\/components\/schemas\/[^"]+/g) ?? [];
    const names = refs.map((r) => r.slice("#/components/schemas/".length));
    expect(names.sort()).toEqual([
      "shop.v1.Item",
      "shop.v1.Order",
      "shop.v1.Status",
    ]);
    for (const name of names)
      expect(doc.components.schemas[name]).toBeDefined();
    expect(doc.components.schemas["shop.v1.Order"]?.properties).toMatchObject({
      placed_at: { type: "string", format: "date-time" },
    });
  });
});

describe("findConverterPath", () => {
  it("converts OpenAPI to proto directly, not through generated TypeSpec", () => {
    expect(findConverterPath("openapi3", "proto")?.map((e) => e.to)).toEqual([
      "proto",
    ]);
  });

  it("still routes TypeSpec to proto directly", () => {
    expect(findConverterPath("typespec", "proto")?.map((e) => e.to)).toEqual([
      "proto",
    ]);
  });
});
