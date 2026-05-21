import type { IR } from "@hey-api/shared";
import {
  classifyEnumLiterals,
  iterateObjectProperties,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { GoDecl } from "../../go-dsl/decl/types.js";
import type { GoType } from "../../go-dsl/index.js";
import { goOps } from "../type-ops.js";
import type { TypeCtx } from "./context.js";

export type { TypeCtx } from "./context.js";

/**
 * Top-level dispatch from `IR.SchemaObject` to a `GoType`. Side-effects:
 * inline objects/enums get promoted to top-level decls via `ctx.emit`.
 * Thin wrapper over the shared `@ir-kit/openapi.schemaToType` with the
 * Go ops record bound.
 */
export function schemaToType(schema: IR.SchemaObject, ctx: TypeCtx): GoType {
  return sharedSchemaToType(schema, ctx, goOps);
}

/**
 * Build a top-level Go struct decl from an object-shaped IR schema —
 * used by `schemasToDecls` for entries in `components.schemas` where
 * the name is given (not synthed from owner+propPath). Mirrors what
 * the dispatcher does in its `named-struct` branch but with the
 * supplied name and without emitting (caller chooses).
 */
export function buildStruct(
  name: string,
  schema: IR.SchemaObject,
  ctx: { emit: (d: GoDecl) => void },
): GoDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: IR.SchemaObject, c: TypeCtx): GoType =>
    sharedSchemaToType(s, c, goOps);
  return goOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, ownerName: name, propPath: [] },
    dispatch,
  );
}

/**
 * Build a top-level Go enum (typed `string` alias + const block) from
 * an enum-typed IR schema. Used by `schemasToDecls` for entries in
 * `components.schemas`. Both decls are pushed via `emit` and a ref
 * to the named type is returned.
 */
export function buildEnumFromIR(
  name: string,
  schema: IR.SchemaObject,
  emit: (d: GoDecl) => void,
): GoType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return goOps.emitIntegerEnum(name, rawValues as number[], emit);
  return goOps.emitStringEnum(name, rawValues as string[], emit);
}
