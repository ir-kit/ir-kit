import type { IR } from "@hey-api/shared";
import { pascal } from "@ir-kit/codegen-core";
import { classifyObjectShape, iterateObjectProperties } from "@ir-kit/openapi";

import {
  type GoStruct,
  type GoType,
  goAny,
  goField,
  goMap,
  goPtr,
  goRef,
  goString,
  goStruct,
} from "../../go-dsl/index.js";
import { synthName } from "../identifiers.js";
import type { TypeCtx } from "./context.js";
import { schemaToType } from "./index.js";
import { propertyName } from "./property-naming.js";

const isMapOrSlice = (t: GoType): boolean =>
  t.kind === "map" || t.kind === "slice";

/**
 * Build a Go struct from an object-shaped IR schema.
 *
 *  - Required fields render as the bare type (`Name string`).
 *  - Optional fields render as a pointer to the type (`Email *string`)
 *    so JSON can distinguish absent (`nil`) from zero-valued. Omitted
 *    fields use the `omitempty` tag — the standard Go idiom.
 *  - JSON-key renaming is preserved via the `json:"<key>"` struct tag.
 */
export function buildStruct(
  name: string,
  schema: IR.SchemaObject,
  ctx: { emit: TypeCtx["emit"] },
): GoStruct {
  const fields: ReturnType<typeof goField>[] = [];
  for (const {
    jsonKey,
    schema: propSchema,
    required,
  } of iterateObjectProperties(schema)) {
    const naming = propertyName(jsonKey);
    const t = schemaToType(propSchema, {
      emit: ctx.emit,
      ownerName: name,
      propPath: [pascal(jsonKey)],
    });
    const optional = !required;
    // Slices and maps are nilable in Go and serialize naturally with
    // `omitempty`; only wrap value-types in `*T` for optional fields.
    const finalType =
      optional && t.kind !== "ptr" && !isMapOrSlice(t) ? goPtr(t) : t;
    const tag = optional
      ? `\`json:"${naming.jsonKey},omitempty"\``
      : `\`json:"${naming.jsonKey}"\``;
    fields.push(goField(naming.goName, finalType, tag));
  }
  return goStruct({ name, fields });
}

/**
 * Resolve an inline object schema to a `GoType`. Schemas with explicit
 * properties are promoted to a synthetic top-level struct
 * (`Owner_PropertyName`); map-shaped objects (no properties, only
 * `additionalProperties`) become Go `map[string]V`.
 */
export function inlineObjectType(
  schema: IR.SchemaObject,
  ctx: TypeCtx,
): GoType {
  const shape = classifyObjectShape(schema);
  switch (shape.kind) {
    case "named-struct": {
      const name = synthName(ctx.ownerName, ctx.propPath);
      ctx.emit(buildStruct(name, schema, ctx));
      return goRef(name);
    }
    case "map":
      return goMap(goString, schemaToType(shape.valueSchema, ctx));
    case "open-map":
      return goMap(goString, goAny);
  }
}
