import type { IR } from "@hey-api/shared";
import { type LocatedParam, paramsAt } from "../../../../openapi/index.js";
import {
  type GoFuncParam,
  type GoStmt,
  goCall,
  goExprStmt,
  goIdent,
  goIf,
  goNe,
  goNil,
  goSelector,
  goStr,
} from "../../ast/index.js";
import { paramIdent } from "../identifiers.js";
import { paramValue } from "./param-value.js";

/**
 * `req.Header.Set("<name>", fmt.Sprint(<value>))` for each header
 * param. Optional headers are nil-guarded;
 * pointer-typed ones are dereferenced inside the guard.
 */
export function buildHeaderStmts(
  located: ReadonlyArray<LocatedParam>,
  params: ReadonlyArray<GoFuncParam>,
): ReadonlyArray<GoStmt> {
  const headers = paramsAt(located, "header");
  return headers.flatMap((p) => buildHeaderStmt(p, params));
}

function buildHeaderStmt(
  p: IR.ParameterObject,
  params: ReadonlyArray<GoFuncParam>,
): ReadonlyArray<GoStmt> {
  const id = paramIdent(p.name);
  const valueExpr = paramValue(id, params);
  const setStmt = goExprStmt(
    goCall(goSelector(goSelector(goIdent("req"), "Header"), "Set"), [
      { expr: goStr(p.name) },
      {
        expr: goCall(goSelector(goIdent("fmt"), "Sprint"), [
          { expr: valueExpr },
        ]),
      },
    ]),
  );
  if (p.required) return [setStmt];
  return [goIf(goNe(goIdent(id), goNil), [setStmt])];
}
