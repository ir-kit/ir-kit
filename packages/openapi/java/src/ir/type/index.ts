import type { Namespace } from "@ir-kit/codegen-core";
import {
  enumType,
  type TypeCtx as IRTypeCtx,
  iterateObjectProperties,
  type Schema,
  schemaToType as sharedSchemaToType,
} from "@ir-kit/openapi";
import { getEnumLiterals } from "@ir-kit/openapi-tools";

import { type JEmitted, type JType, jRef } from "../../ast/index.js";
import { javaOps } from "../type-ops.js";

export type TypeCtx = IRTypeCtx<JEmitted>;

export function schemaToType(schema: Schema, ctx: TypeCtx): JType {
  return sharedSchemaToType(schema, ctx, javaOps);
}

export function buildStruct(
  name: string,
  schema: Schema,
  ctx: { emit: (d: JEmitted) => void; names: Namespace },
): JEmitted {
  return javaOps.buildStructDecl(
    name,
    Array.from(iterateObjectProperties(schema)),
    { emit: ctx.emit, names: ctx.names, ownerName: name, propPath: [] },
    schemaToType,
  );
}

export function buildEnumFromIR(
  name: string,
  schema: Schema,
  emit: (d: JEmitted) => void,
  names: Namespace,
): JType {
  const { type, named } = enumType(name, getEnumLiterals(schema), javaOps, {
    emit,
    names,
  });
  if (named) return type;
  emit({ kind: "alias", name, target: type });
  return jRef(name);
}
