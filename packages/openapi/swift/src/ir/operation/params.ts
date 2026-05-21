import type { IR } from "@hey-api/shared";
import {
  collectLocatedParams,
  fromHeyApi,
  type LocatedParam,
} from "@ir-kit/openapi";

import type { SwFunParam } from "../../sw-dsl/index.js";
import { swFunParam, swOptional } from "../../sw-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

/**
 * Path/query/header parameters as function params, required-first.
 * Cookie params are skipped — URLSession has no analog and they're
 * rare enough not to warrant codegen support.
 */
export function buildNonBodyParams(
  op: IR.OperationObject,
  ctx: TypeCtx,
): { params: SwFunParam[]; located: LocatedParam[] } {
  const located = collectLocatedParams(op).filter((l) => l.loc !== "cookie");
  located.sort((a, b) => Number(!a.param.required) - Number(!b.param.required));

  const params = located.map(({ param: p }) => {
    const t = schemaToType(fromHeyApi(p.schema), {
      ...ctx,
      propPath: ["param", p.name],
    });
    return swFunParam({
      name: paramIdent(p.name),
      type: p.required ? t : swOptional(t),
      default: p.required ? undefined : "nil",
    });
  });

  return { params, located };
}
