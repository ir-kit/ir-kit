import type { IR } from "@hey-api/shared";

/**
 * High-level dispatch for inline object schemas. Each emitter then
 * picks its target rendering:
 *
 *  - `named-struct`  → synth a name, emit a struct/data-class/struct,
 *                      return a ref to it
 *  - `map`           → render as `map[string]V` / `Map<String, V>` /
 *                      `[String: V]` over the inner value schema
 *  - `open-map`      → same map, but value is `any` / `Any` / `Any`
 *                      since `additionalProperties` was missing or
 *                      `true`/empty
 */
export type ObjectShape =
  | { kind: "named-struct" }
  | { kind: "map"; valueSchema: IR.SchemaObject }
  | { kind: "open-map" };

/**
 * Classify an object-shaped schema by its property layout. Used by
 * each emitter's `inlineObjectType` to drive the same three-way
 * dispatch identically.
 */
export function classifyObjectShape(schema: IR.SchemaObject): ObjectShape {
  const hasNamedProperties = Object.keys(schema.properties ?? {}).length > 0;
  if (hasNamedProperties) return { kind: "named-struct" };
  const ap = schema.additionalProperties;
  if (ap && typeof ap === "object") return { kind: "map", valueSchema: ap };
  return { kind: "open-map" };
}

export interface ObjectProperty {
  jsonKey: string;
  schema: IR.SchemaObject;
  /** True when the property name appears in `schema.required`. */
  required: boolean;
  /** True when the property is `string` + `format: "binary"`. Common
   *  enough across emitters (multipart-binary handling) to surface
   *  alongside the basic iteration. */
  isBinary: boolean;
}

/**
 * Walk `schema.properties` in declaration order and yield one
 * `ObjectProperty` per entry, with the `required` membership and
 * binary-format detection pre-computed. Used by every emitter's
 * `type/object.ts` (struct/data-class/struct field generation) and
 * `operation/body.ts` (multipart / urlencoded flat-param expansion).
 */
export function* iterateObjectProperties(
  schema: IR.SchemaObject,
): Generator<ObjectProperty> {
  const required = new Set(schema.required ?? []);
  for (const [jsonKey, propSchema] of Object.entries(schema.properties ?? {})) {
    yield {
      jsonKey,
      schema: propSchema,
      required: required.has(jsonKey),
      isBinary: propSchema.type === "string" && propSchema.format === "binary",
    };
  }
}
