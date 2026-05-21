import type { IR } from "@hey-api/shared";
import {
  classifyEnumLiterals,
  iterateObjectProperties,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { SwDecl, SwType } from "../../sw-dsl/index.js";
import { swOps } from "../type-ops.js";
import type { TypeCtx } from "./context.js";

export type { TypeCtx } from "./context.js";

/**
 * Top-level dispatch from `IR.SchemaObject` to a `SwType`. Side-effects:
 * inline objects/enums get promoted to top-level decls via `ctx.emit`.
 * Thin wrapper over the shared `@ir-kit/openapi.schemaToType` with the
 * Swift ops record bound.
 */
export function schemaToType(schema: IR.SchemaObject, ctx: TypeCtx): SwType {
  return sharedSchemaToType(schema, ctx, swOps);
}

/**
 * Build a top-level Swift `Codable` struct from an object-shaped IR
 * schema — used by `schemasToDecls` for `components.schemas` entries
 * where the name is given. Returns the decl; caller decides whether
 * to emit.
 */
export function buildStruct(
  name: string,
  schema: IR.SchemaObject,
  ctx: { emit: (d: SwDecl) => void },
): SwDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: IR.SchemaObject, c: TypeCtx): SwType =>
    sharedSchemaToType(s, c, swOps);
  return swOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, ownerName: name, propPath: [] },
    dispatch,
  );
}

/**
 * Build a top-level Swift raw-typed enum (`: String, Codable` or
 * `: Int, Codable`) from an enum-typed IR schema. Decl is pushed via
 * `emit`; a ref to the named type is returned.
 */
export function buildEnumFromIR(
  name: string,
  schema: IR.SchemaObject,
  emit: (d: SwDecl) => void,
): SwType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return swOps.emitIntegerEnum(name, rawValues as number[], emit);
  return swOps.emitStringEnum(name, rawValues as string[], emit);
}
