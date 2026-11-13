import type { IR } from "../../../../ir/index.js";
import {
  collectLocatedParams,
  fromHeyApi,
  type LocatedParam,
} from "../../../../openapi/index.js";

import { type JParam, jParam } from "../../ast/index.js";
import { operationParamIdent } from "../identifiers.js";
import type { TypeCtx } from "../type/index.js";
import { schemaToType } from "../type/index.js";

export function buildNonBodyParams(
  op: IR.Operation,
  ctx: TypeCtx,
): { params: JParam[]; located: LocatedParam[] } {
  const located = collectLocatedParams(op).filter((l) => l.loc !== "cookie");
  located.sort((a, b) => Number(!a.param.required) - Number(!b.param.required));
  const params = located.map(({ param: p }) =>
    jParam(
      operationParamIdent(p.name),
      schemaToType(fromHeyApi(p.schema), {
        ...ctx,
        propPath: ["param", p.name],
      }),
    ),
  );
  return { params, located };
}
