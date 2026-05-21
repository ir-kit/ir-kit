import type { IR } from "@hey-api/shared";
import {
  classifyEnumLiterals,
  iterateObjectProperties,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import type { KtDecl } from "../../kt-dsl/decl/types.js";
import type { KtType } from "../../kt-dsl/index.js";
import { ktOps } from "../type-ops.js";
import type { TypeCtx } from "./context.js";

export type { TypeCtx } from "./context.js";

/**
 * Top-level dispatch from `IR.SchemaObject` to a `KtType`. Side-effects:
 * inline objects/enums get promoted to top-level decls via `ctx.emit`.
 * Thin wrapper over the shared `@ir-kit/openapi.schemaToType` with the
 * Kotlin ops record bound.
 */
export function schemaToType(schema: IR.SchemaObject, ctx: TypeCtx): KtType {
  return sharedSchemaToType(schema, ctx, ktOps);
}

/**
 * Build a top-level Kotlin data class from an object-shaped IR schema
 * — used by `schemasToDecls` for `components.schemas` entries where
 * the name is given. Returns the decl; caller decides whether to emit.
 */
export function buildStruct(
  name: string,
  schema: IR.SchemaObject,
  ctx: { emit: (d: KtDecl) => void },
): KtDecl {
  const properties = Array.from(iterateObjectProperties(schema));
  const dispatch = (s: IR.SchemaObject, c: TypeCtx): KtType =>
    sharedSchemaToType(s, c, ktOps);
  return ktOps.buildStructDecl(
    name,
    properties,
    { emit: ctx.emit, ownerName: name, propPath: [] },
    dispatch,
  );
}

/**
 * Build a top-level Kotlin enum (`enum class(val raw: String)`) or
 * integer-degrade typealias from an enum-typed IR schema. Decls are
 * pushed via `emit`; a ref to the named type is returned.
 */
export function buildEnumFromIR(
  name: string,
  schema: IR.SchemaObject,
  emit: (d: KtDecl) => void,
): KtType {
  const rawValues = getEnumLiterals(schema);
  const kind = classifyEnumLiterals(rawValues, name);
  if (kind === "integer")
    return ktOps.emitIntegerEnum(name, rawValues as number[], emit);
  return ktOps.emitStringEnum(name, rawValues as string[], emit);
}
