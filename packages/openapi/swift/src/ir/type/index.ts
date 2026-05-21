import {
  classifyEnumLiterals,
  iterateObjectProperties,
  type Schema,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { SwDecl, SwType } from "../../sw-dsl/index.js";
import { swOps } from "../type-ops.js";
import type { TypeCtx } from "./context.js";

export type { TypeCtx } from "./context.js";

/**
 * Top-level dispatch from canonical {@link Schema} to a `SwType`.
 * Side-effects: inline objects / enums get promoted to top-level decls
 * via `ctx.emit`.
 */
export function schemaToType(schema: Schema, ctx: TypeCtx): SwType {
  return sharedSchemaToType(schema, ctx, swOps);
}

export function buildStruct(
  name: string,
  schema: Schema,
  ctx: { emit: (d: SwDecl) => void },
): SwDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: Schema, c: TypeCtx): SwType =>
    sharedSchemaToType(s, c, swOps);
  return swOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, ownerName: name, propPath: [] },
    dispatch,
  );
}

export function buildEnumFromIR(
  name: string,
  schema: Schema,
  emit: (d: SwDecl) => void,
): SwType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return swOps.emitIntegerEnum(name, rawValues as number[], emit);
  return swOps.emitStringEnum(name, rawValues as string[], emit);
}
