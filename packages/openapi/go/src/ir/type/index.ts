import {
  classifyEnumLiterals,
  iterateObjectProperties,
  type Schema,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { GoDecl } from "../../go-dsl/decl/types.js";
import type { GoType } from "../../go-dsl/index.js";
import { goOps } from "../type-ops.js";
import type { TypeCtx } from "./context.js";

export type { TypeCtx } from "./context.js";

/**
 * Top-level dispatch from a canonical {@link Schema} to a `GoType`.
 * Side-effects: inline objects / enums get promoted to top-level decls
 * via `ctx.emit`.
 */
export function schemaToType(schema: Schema, ctx: TypeCtx): GoType {
  return sharedSchemaToType(schema, ctx, goOps);
}

/**
 * Build a top-level Go struct from an object-shaped canonical schema
 * with a caller-supplied name. Mirrors the dispatcher's `named-struct`
 * branch but skips the synth-name step and doesn't emit (caller chooses).
 */
export function buildStruct(
  name: string,
  schema: Schema,
  ctx: { emit: (d: GoDecl) => void },
): GoDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: Schema, c: TypeCtx): GoType =>
    sharedSchemaToType(s, c, goOps);
  return goOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, ownerName: name, propPath: [] },
    dispatch,
  );
}

/**
 * Build a top-level Go enum (typed alias + const block) from an
 * enum-shaped canonical schema. Both decls are pushed via `emit` and a
 * ref to the named type is returned.
 */
export function buildEnumFromIR(
  name: string,
  schema: Schema,
  emit: (d: GoDecl) => void,
): GoType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return goOps.emitIntegerEnum(name, rawValues as number[], emit);
  return goOps.emitStringEnum(name, rawValues as string[], emit);
}
