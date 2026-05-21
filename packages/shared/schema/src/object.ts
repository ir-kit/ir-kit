import { pascal } from "@ir-kit/codegen-core";

import { isSchemaObject, type Schema } from "./types.js";

/**
 * Three-way object dispatch. Emitters render:
 *  - `named-struct` → synth name, emit struct/data-class, return ref
 *  - `map`          → wrap value in target map (`map[string]V`, etc.)
 *  - `open-map`     → same map, value is target `any`
 */
export type ObjectShape =
  | { kind: "named-struct" }
  | { kind: "map"; valueSchema: Schema }
  | { kind: "open-map" };

export function classifyObject(schema: Schema): ObjectShape {
  if (Object.keys(schema.properties ?? {}).length > 0)
    return { kind: "named-struct" };
  const ap = schema.additionalProperties;
  if (ap && isSchemaObject(ap))
    return { kind: "map", valueSchema: ap as Schema };
  return { kind: "open-map" };
}

export interface ObjectProperty {
  jsonKey: string;
  schema: Schema;
  required: boolean;
  /** `string` + `format: "binary"`. Common enough across emitters
   *  (multipart-binary handling) to surface alongside the iteration. */
  isBinary: boolean;
  /** Pre-pascal'd segment ready to plug into `synthName(owner, [seg])`.
   *  All emitters synth identifiers from PascalCase pieces; computing
   *  once here keeps emitters narrow. */
  propPathSegment: string;
}

export function* iterateObjectProperties(
  schema: Schema,
): Generator<ObjectProperty> {
  const required = new Set(schema.required ?? []);
  for (const [jsonKey, propSchema] of Object.entries(schema.properties ?? {})) {
    if (!isSchemaObject(propSchema)) continue;
    yield {
      jsonKey,
      schema: propSchema as Schema,
      required: required.has(jsonKey),
      isBinary: propSchema.type === "string" && propSchema.format === "binary",
      propPathSegment: pascal(jsonKey),
    };
  }
}
