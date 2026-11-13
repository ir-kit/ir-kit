import type { Namespace } from "../../../../codegen/index.js";
import {
  enumType,
  iterateObjectProperties,
  type Schema,
  schemaToType as sharedSchemaToType,
} from "../../../../openapi/index.js";
import { getEnumLiterals } from "../../../../openapi-tools/index.js";

import {
  type SwDecl,
  type SwType,
  swRef,
  swTypeAlias,
} from "../../ast/index.js";
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
  ctx: { emit: (d: SwDecl) => void; names: Namespace },
): SwDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: Schema, c: TypeCtx): SwType =>
    sharedSchemaToType(s, c, swOps);
  return swOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, names: ctx.names, ownerName: name, propPath: [] },
    dispatch,
  );
}

export function buildEnumFromIR(
  name: string,
  schema: Schema,
  emit: (d: SwDecl) => void,
  names: Namespace,
): SwType {
  const { type, named } = enumType(name, getEnumLiterals(schema), swOps, {
    emit,
    names,
  });
  if (named) return type;
  emit(swTypeAlias({ name, type }));
  return swRef(name);
}
