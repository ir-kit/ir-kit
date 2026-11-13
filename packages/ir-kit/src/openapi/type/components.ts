import type { Namespace } from "../../codegen/index.js";
import type { IR } from "../../ir/index.js";
import { refName, type Schema } from "../../schema/index.js";

import { schemaTypeName } from "./dispatch.js";

/** How a top-level component schema maps onto a declaration. */
export type ComponentShape =
  /** Alias of another component, by its claimed type name. */
  | { kind: "ref"; target: string }
  | { kind: "enum" }
  /** Object with properties, or sealed (`additionalProperties: false`). */
  | { kind: "struct" }
  /** Open object; `value` is the typed `additionalProperties`, if any. */
  | { kind: "map"; value?: Schema }
  /** Anything else: an alias of the schema's own type. */
  | { kind: "type" };

export interface Component {
  name: string;
  schema: Schema;
  shape: ComponentShape;
}

/**
 * Claim every component's type name, then classify each one. Names are
 * claimed up front so they win over synthesized inline type names.
 */
export function classifyComponents(
  schemas: Record<string, IR.Schema>,
  names: Namespace,
): Component[] {
  for (const rawName of Object.keys(schemas)) schemaTypeName(names, rawName);
  return Object.entries(schemas).map(([rawName, heySchema]) => {
    const schema = heySchema;
    return {
      name: schemaTypeName(names, rawName),
      schema,
      shape: componentShape(schema, names),
    };
  });
}

function componentShape(schema: Schema, names: Namespace): ComponentShape {
  if (schema.$ref) {
    return { kind: "ref", target: schemaTypeName(names, refName(schema.$ref)) };
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return { kind: "enum" };
  }
  if (schema.type !== "object") return { kind: "type" };
  const ap = schema.additionalProperties;
  if (schema.properties || ap === false) return { kind: "struct" };
  return { kind: "map", value: ap && typeof ap === "object" ? ap : undefined };
}
