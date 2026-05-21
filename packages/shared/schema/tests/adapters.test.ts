import type { IR } from "@hey-api/shared";
import { describe, expect, it } from "vitest";

import { fromHeyApi } from "../src/adapters/heyapi.ts";
import { fromJsonSchema } from "../src/adapters/jsonschema.ts";

describe("fromHeyApi", () => {
  it("translates type:enum + items[].const into enum + inferred type", () => {
    const s: IR.SchemaObject = {
      type: "enum",
      items: [{ const: "open" }, { const: "closed" }],
    };
    const out = fromHeyApi(s);
    expect(out.enum).toEqual(["open", "closed"]);
    expect(out.type).toBe("string");
  });

  it("translates logicalOperator or → oneOf, and → allOf", () => {
    const or: IR.SchemaObject = {
      logicalOperator: "or",
      items: [{ type: "string" }, { type: "null" }],
    };
    expect(fromHeyApi(or).oneOf?.length).toBe(2);

    const and: IR.SchemaObject = {
      logicalOperator: "and",
      items: [{ type: "object" }, { type: "object" }],
    };
    expect(fromHeyApi(and).allOf?.length).toBe(2);
  });

  it("flattens type:array + items:[elem] into items:elem", () => {
    const s: IR.SchemaObject = {
      type: "array",
      items: [{ type: "string" }],
    };
    const out = fromHeyApi(s);
    expect(out.type).toBe("array");
    expect(out.items?.type).toBe("string");
  });

  it("preserves properties and required", () => {
    const s: IR.SchemaObject = {
      type: "object",
      properties: { name: { type: "string" }, age: { type: "integer" } },
      required: ["name"],
    };
    const out = fromHeyApi(s);
    expect(out.properties?.name?.type).toBe("string");
    expect(out.required).toEqual(["name"]);
  });

  it("drops type for void/never/undefined", () => {
    expect(fromHeyApi({ type: "void" }).type).toBeUndefined();
    expect(fromHeyApi({ type: "never" }).type).toBeUndefined();
  });
});

describe("fromJsonSchema", () => {
  it("draft-04 boolean exclusiveMinimum → number", () => {
    const out = fromJsonSchema(
      { type: "integer", minimum: 0, exclusiveMinimum: true },
      { dialect: "draft-04" },
    );
    expect(out.exclusiveMinimum).toBe(0);
  });

  it("OpenAPI 3.0 nullable folds into type array", () => {
    const out = fromJsonSchema({ type: "string", nullable: true });
    expect(out.type).toEqual(["string", "null"]);
  });

  it("draft-07 items[] tuple → prefixItems", () => {
    const out = fromJsonSchema(
      { type: "array", items: [{ type: "string" }, { type: "integer" }] },
      { dialect: "draft-07" },
    );
    expect(out.prefixItems?.length).toBe(2);
    expect(out.items).toBeUndefined();
  });

  it("definitions → $defs", () => {
    const out = fromJsonSchema(
      {
        $ref: "#/definitions/User",
        definitions: { User: { type: "object" } },
      },
      { dialect: "draft-07" },
    );
    expect(out.$defs?.User?.type).toBe("object");
  });

  it("passes through 2020-12 input unchanged in shape", () => {
    const out = fromJsonSchema({
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
    });
    expect(out.type).toBe("object");
    expect(out.required).toEqual(["a"]);
  });

  it("carries OpenAPI discriminator", () => {
    const out = fromJsonSchema({
      oneOf: [{ type: "object" }],
      discriminator: { propertyName: "kind", mapping: { x: "#/X" } },
    });
    expect(out.discriminator?.propertyName).toBe("kind");
    expect(out.discriminator?.mapping?.x).toBe("#/X");
  });
});
