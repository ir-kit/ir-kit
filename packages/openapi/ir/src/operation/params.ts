import type { IR } from "@hey-api/shared";

export type ParamLocation = "path" | "query" | "header" | "cookie";

export const PARAM_LOCATIONS: ReadonlyArray<ParamLocation> = [
  "path",
  "query",
  "header",
  "cookie",
];

export interface LocatedParam {
  param: IR.ParameterObject;
  loc: ParamLocation;
}

/**
 * Flatten `op.parameters.{path,query,header,cookie}` into a single
 * array, preserving the location each came from. Result order follows
 * `PARAM_LOCATIONS` (path → query → header → cookie), and within each
 * bucket follows `Object.values` iteration order.
 *
 * Emitters typically further filter (e.g. Go drops cookies) and sort
 * (required-first); those decisions stay per-target.
 */
export function collectLocatedParams(op: IR.OperationObject): LocatedParam[] {
  const out: LocatedParam[] = [];
  for (const loc of PARAM_LOCATIONS) {
    const bucket = op.parameters?.[loc];
    if (!bucket) continue;
    for (const param of Object.values(bucket)) out.push({ param, loc });
  }
  return out;
}
