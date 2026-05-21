import type { IR } from "@hey-api/shared";
import { collectLocatedParams, type LocatedParam } from "@ir-kit/openapi";

import { type KtFunParam, ktFunParam, ktNullable } from "../../kt-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

/**
 * Produce the function parameters for path/query/header parameters in
 * required-first order (so trailing optional defaults stay tail-only).
 * Cookie params are skipped — OkHttp / kotlinx-serialization have no
 * idiomatic cookie-param mapping and they're rare enough not to warrant
 * codegen support.
 */
export function buildNonBodyParams(
  op: IR.OperationObject,
  ctx: TypeCtx,
): { params: KtFunParam[]; located: LocatedParam[] } {
  const located = collectLocatedParams(op).filter((l) => l.loc !== "cookie");
  located.sort((a, b) => Number(!a.param.required) - Number(!b.param.required));

  const params = located.map(({ param: p }) => {
    const t = schemaToType(p.schema, {
      ...ctx,
      propPath: ["param", p.name],
    });
    return ktFunParam({
      name: paramIdent(p.name),
      type: p.required ? t : ktNullable(t),
      default: p.required ? undefined : "null",
    });
  });

  return { params, located };
}
