import type { IR } from "@hey-api/shared";

/**
 * Outcome of inspecting a union-shaped schema. Pure structural —
 * caller still needs to decide how to render each kind in its target
 * language (Go pointer vs Kotlin nullable vs Swift optional, fall-back
 * to `any` vs `Any` vs language equivalents).
 */
export type UnionShape =
  | { kind: "intersection-with-properties" }
  | { kind: "intersection-empty" }
  | { kind: "single"; inner: IR.SchemaObject; nullable: boolean }
  | { kind: "multi"; nullable: boolean };

/**
 * Classify a union-shaped schema (`logicalOperator: "or" | "and"`)
 * into one of the cases each emitter handles. hey-api represents
 * OpenAPI 3.1 nullables as `or` unions with a `{type:"null"}` branch;
 * `allOf` folds become `and`.
 *
 *  - `and` + properties → caller dispatches to its inline-object path.
 *  - `and` empty        → caller renders its `any` analog.
 *  - 1 non-null branch  → caller renders the inner, applying its own
 *                         nullable wrapper iff `nullable === true`.
 *  - 2+ non-null        → caller falls back to its `any`; `nullable`
 *                         is reported but caller decides whether to
 *                         apply it (Go drops it, KT/Swift wrap).
 */
export function classifyUnion(schema: IR.SchemaObject): UnionShape {
  if (schema.logicalOperator === "and") {
    return schema.properties
      ? { kind: "intersection-with-properties" }
      : { kind: "intersection-empty" };
  }
  const items = schema.items ?? [];
  const nonNull = items.filter((i) => i.type !== "null");
  const nullable = nonNull.length < items.length;
  if (nonNull.length === 1) {
    return { kind: "single", inner: nonNull[0]!, nullable };
  }
  return { kind: "multi", nullable };
}
