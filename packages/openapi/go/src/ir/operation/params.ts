import type { IR } from "@hey-api/shared";
import { collectLocatedParams, type LocatedParam } from "@ir-kit/openapi";

import {
  type GoFuncParam,
  type GoType,
  goFuncParam,
  goPtr,
} from "../../go-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

const isPointerable = (t: GoType): boolean =>
  t.kind !== "ptr" &&
  t.kind !== "slice" &&
  t.kind !== "map" &&
  t.kind !== "interface";

/**
 * Produce the function parameters for path/query/header parameters.
 * Cookie params are skipped — net/http has no idiomatic cookie-as-arg
 * mapping and they're rare enough not to warrant codegen support.
 *
 * Optional parameters become pointer types (`*string`, `*int64`) so
 * callers can pass `nil` to omit them. Required parameters use the
 * bare type.
 *
 * Unlike Swift / Kotlin, Go doesn't have default arguments, so we
 * keep both required and optional params in the same positional list.
 * Required-first ordering keeps the "common case" arg list short
 * for callers who don't use optional params.
 */
export function buildNonBodyParams(
  op: IR.OperationObject,
  ctx: TypeCtx,
): { params: GoFuncParam[]; located: LocatedParam[] } {
  const located = collectLocatedParams(op).filter((l) => l.loc !== "cookie");
  located.sort((a, b) => Number(!a.param.required) - Number(!b.param.required));

  const params = located.map(({ param: p }) => {
    const t = schemaToType(p.schema, {
      ...ctx,
      propPath: ["param", p.name],
    });
    const finalType = p.required || !isPointerable(t) ? t : goPtr(t);
    return goFuncParam(paramIdent(p.name), finalType);
  });

  return { params, located };
}
