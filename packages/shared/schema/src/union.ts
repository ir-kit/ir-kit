import {
  isNullable,
  isSchemaObject,
  type Schema,
  type SchemaOrBool,
  typeList,
} from "./types.js";

/**
 * Composition-shape outcomes. Each emitter renders per-target — Go
 * pointer vs Kotlin nullable vs Swift optional, fallback to `any` vs
 * `Any`. `nullable` is reported on `single`/`multi` but caller decides
 * whether to apply it (Go drops, Kotlin/Swift wrap).
 */
export type UnionShape =
  | { kind: "intersection-with-properties" }
  | { kind: "intersection-empty" }
  | { kind: "single"; inner: Schema; nullable: boolean }
  | { kind: "multi"; nullable: boolean };

export function classifyUnion(schema: Schema): UnionShape {
  if (schema.allOf && schema.allOf.length > 0) {
    return schema.properties
      ? { kind: "intersection-with-properties" }
      : { kind: "intersection-empty" };
  }

  const branches = schema.oneOf ?? schema.anyOf;
  if (branches && branches.length > 0) {
    const objectBranches = branches.filter(isSchemaObject);
    const nonNull = objectBranches.filter(
      (b) => b.type !== "null" && !(Array.isArray(b.type) && onlyNull(b.type)),
    );
    const nullable =
      nonNull.length < branches.length ||
      objectBranches.some((b) => isNullable(b as Schema));
    if (nonNull.length === 1) {
      return { kind: "single", inner: nonNull[0]! as Schema, nullable };
    }
    return { kind: "multi", nullable };
  }

  const types = typeList(schema);
  const nonNullTypes = types.filter((t) => t !== "null");
  if (types.length > 1) {
    const nullable = isNullable(schema);
    if (nonNullTypes.length === 1) {
      return {
        kind: "single",
        inner: { ...schema, type: nonNullTypes[0]! },
        nullable,
      };
    }
    return { kind: "multi", nullable };
  }

  return { kind: "multi", nullable: false };
}

export function isUnionShape(schema: Schema): boolean {
  if (schema.allOf && schema.allOf.length > 0) return true;
  if (schema.oneOf && schema.oneOf.length > 0) return true;
  if (schema.anyOf && schema.anyOf.length > 0) return true;
  return Array.isArray(schema.type) && schema.type.length > 1;
}

function onlyNull(t: ReadonlyArray<unknown>): boolean {
  return t.length === 1 && t[0] === "null";
}

export type { SchemaOrBool };
