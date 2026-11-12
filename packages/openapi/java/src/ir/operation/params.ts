import type { IR } from "@hey-api/shared";
import {
  collectLocatedParams,
  fromHeyApi,
  type LocatedParam,
} from "@ir-kit/openapi";

import { type JParam, jParam } from "../../ast/index.js";
import { paramIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

export function buildNonBodyParams(
  op: IR.OperationObject,
  ctx: TypeCtx,
): { params: JParam[]; located: LocatedParam[] } {
  const located = collectLocatedParams(op).filter((l) => l.loc !== "cookie");
  located.sort((a, b) => Number(!a.param.required) - Number(!b.param.required));
  const params = located.map(({ param: p }) =>
    jParam(
      paramIdent(p.name),
      schemaToType(fromHeyApi(p.schema), {
        ...ctx,
        propPath: ["param", p.name],
      }),
    ),
  );
  return { params, located };
}
