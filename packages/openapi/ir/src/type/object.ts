import type { IR } from "@hey-api/shared";

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
