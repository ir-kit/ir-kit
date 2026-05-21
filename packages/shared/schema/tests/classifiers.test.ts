import { describe, expect, it } from "vitest";
import type { Schema } from "../src/index.ts";
import {
  classifyEnumLiterals,
  classifyObject,
  classifyUnion,
  extractEnumValues,
  isNullable,
  isPrimitive,
  primitiveTag,
  refName,
  typeList,
} from "../src/index.ts";

describe("typeList / isNullable", () => {
  it("normalizes single + array forms", () => {
    expect(typeList({ type: "string" })).toEqual(["string"]);
    expect(typeList({ type: ["string", "null"] })).toEqual(["string", "null"]);
    expect(typeList({})).toEqual([]);
  });

  it("detects null in type[] and in oneOf/anyOf branches", () => {
    expect(isNullable({ type: ["string", "null"] })).toBe(true);
    expect(isNullable({ oneOf: [{ type: "string" }, { type: "null" }] })).toBe(
      true,
    );
    expect(isNullable({ type: "string" })).toBe(false);
  });
});

describe("classifyUnion", () => {
  it("collapses single non-null oneOf branch with nullable", () => {
    const r = classifyUnion({
      oneOf: [{ type: "string" }, { type: "null" }],
    });
    expect(r.kind).toBe("single");
    if (r.kind === "single") {
      expect(r.inner.type).toBe("string");
      expect(r.nullable).toBe(true);
    }
  });

  it("reports multi when 2+ non-null branches", () => {
    const r = classifyUnion({
      anyOf: [{ type: "string" }, { type: "integer" }, { type: "null" }],
    });
    expect(r.kind).toBe("multi");
    if (r.kind === "multi") expect(r.nullable).toBe(true);
  });

  it("treats type:[s, null] like a single-branch nullable", () => {
    const r = classifyUnion({ type: ["string", "null"] });
    expect(r.kind).toBe("single");
    if (r.kind === "single") {
      expect(r.inner.type).toBe("string");
      expect(r.nullable).toBe(true);
    }
  });

  it("distinguishes intersection-with-properties from intersection-empty", () => {
    expect(
      classifyUnion({ allOf: [{ type: "object" }], properties: { a: {} } })
        .kind,
    ).toBe("intersection-with-properties");
    expect(classifyUnion({ allOf: [{ type: "object" }] }).kind).toBe(
      "intersection-empty",
    );
  });
});

describe("classifyObject", () => {
  it("routes properties → named-struct, schema additionalProperties → map", () => {
    expect(classifyObject({ properties: { a: {} } }).kind).toBe("named-struct");
    const r = classifyObject({ additionalProperties: { type: "string" } });
    expect(r.kind).toBe("map");
    if (r.kind === "map") expect(r.valueSchema.type).toBe("string");
    expect(classifyObject({}).kind).toBe("open-map");
  });
});

describe("extractEnumValues / classifyEnumLiterals", () => {
  it("reads explicit enum and oneOf-of-consts", () => {
    expect(extractEnumValues({ enum: ["a", "b"] })).toEqual(["a", "b"]);
    expect(extractEnumValues({ oneOf: [{ const: 1 }, { const: 2 }] })).toEqual([
      1, 2,
    ]);
    expect(extractEnumValues({ type: "string" })).toBeUndefined();
  });

  it("classifies all-string vs all-integer; throws on mix", () => {
    expect(classifyEnumLiterals(["a", "b"], "X")).toBe("string");
    expect(classifyEnumLiterals([1, 2], "X")).toBe("integer");
    expect(() => classifyEnumLiterals(["a", 1], "X")).toThrow(/Enum X/);
  });
});

describe("isPrimitive / primitiveTag", () => {
  it("reports tag for single + nullable primitive, undefined for compound", () => {
    expect(isPrimitive({ type: "string" })).toBe(true);
    expect(isPrimitive({ type: ["string", "null"] })).toBe(true);
    expect(isPrimitive({ type: "object" })).toBe(false);
    expect(primitiveTag({ type: ["integer", "null"] })).toBe("integer");
    expect(primitiveTag({ type: ["string", "integer"] })).toBeUndefined();
  });
});

describe("refName", () => {
  it("returns last segment with pointer escapes decoded", () => {
    expect(refName("#/components/schemas/Pet")).toBe("Pet");
    expect(refName("#/$defs/User")).toBe("User");
    expect(refName("#/components/schemas/has~1slash")).toBe("has/slash");
    expect(refName("")).toBe("");
  });
});

describe("Schema type sanity", () => {
  it("compiles", () => {
    const s: Schema = {
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
    };
    expect(s.type).toBe("object");
  });
});
