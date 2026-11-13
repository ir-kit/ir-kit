import type { IR } from "../../../../ir/index.js";
import { type LocatedParam, paramsAt } from "../../../../openapi/index.js";
import type { SwExpr, SwStmt } from "../../ast/index.js";
import {
  swArg,
  swCall,
  swExprStmt,
  swIdent,
  swIfLet,
  swInterp,
  swMember,
  swStr,
} from "../../ast/index.js";
import { paramIdent } from "../identifiers.js";

/**
 * `request.setValue("\(<name>)", forHTTPHeaderField: "<name>")` for each
 * header param. Optional headers are wrapped in `if let`.
 */
export function buildHeaderStmts(
  located: ReadonlyArray<LocatedParam>,
): ReadonlyArray<SwStmt> {
  const headers = paramsAt(located, "header");
  return headers.flatMap(buildHeaderStmt);
}

function buildHeaderStmt(p: IR.Parameter): ReadonlyArray<SwStmt> {
  const id = paramIdent(p.name);
  const setValue = (ref: SwExpr): SwStmt =>
    swExprStmt(
      swCall(swMember(swIdent("request"), "setValue"), [
        swArg(swInterp([ref])),
        swArg(swStr(p.name), "forHTTPHeaderField"),
      ]),
    );
  if (p.required) return [setValue(swIdent(id))];
  return [swIfLet(id, swIdent(id), [setValue(swIdent(id))])];
}
