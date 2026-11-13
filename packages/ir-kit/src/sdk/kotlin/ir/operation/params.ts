import type { IR } from "../../../../ir/index.js";
import {
  collectLocatedParams,
  type LocatedParam,
} from "../../../../openapi/index.js";

import { type KtFunParam, ktFunParam, ktNullable } from "../../ast/index.js";
import { operationParamIdent } from "../identifiers.js";
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
  op: IR.Operation,
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
      name: operationParamIdent(p.name),
      type: p.required ? t : ktNullable(t),
      default: p.required ? undefined : "null",
    });
  });

  return { params, located };
}
