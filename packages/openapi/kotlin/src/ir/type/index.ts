import {
  classifyEnumLiterals,
  iterateObjectProperties,
  type Schema,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { KtDecl } from "../../kt-dsl/decl/types.js";
import type { KtType } from "../../kt-dsl/index.js";
import { ktOps } from "../type-ops.js";
import type { TypeCtx } from "./context.js";

export type { TypeCtx } from "./context.js";

/**
 * Top-level dispatch from canonical {@link Schema} to a `KtType`.
 * Side-effects: inline objects / enums get promoted to top-level decls
 * via `ctx.emit`.
 */
export function schemaToType(schema: Schema, ctx: TypeCtx): KtType {
  return sharedSchemaToType(schema, ctx, ktOps);
}

export function buildStruct(
  name: string,
  schema: Schema,
  ctx: { emit: (d: KtDecl) => void },
): KtDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: Schema, c: TypeCtx): KtType =>
    sharedSchemaToType(s, c, ktOps);
  return ktOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, ownerName: name, propPath: [] },
    dispatch,
  );
}

export function buildEnumFromIR(
  name: string,
  schema: Schema,
  emit: (d: KtDecl) => void,
): KtType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return ktOps.emitIntegerEnum(name, rawValues as number[], emit);
  return ktOps.emitStringEnum(name, rawValues as string[], emit);
}
