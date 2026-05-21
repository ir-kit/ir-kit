import type { IR } from "@hey-api/shared";
import {
  type LocatedParam,
  paramsAt,
  parseTemplatedSegment,
  splitPathSegments,
} from "@ir-kit/openapi";
import {
  type KtCallArg,
  type KtExpr,
  type KtStmt,
  ktArg,
  ktBoolLit,
  ktCall,
  ktExprStmt,
  ktIdent,
  ktInterp,
  ktMember,
  ktStr,
  ktVal,
  ktVar,
} from "../../kt-dsl/index.js";
import { paramIdent } from "../identifiers.js";

/**
 * Statements that build an `HttpUrl` from `baseUrl`, the path template,
 * and query parameters. The result is bound to `url`.
 *
 *  - Path-template parameters become `addPathSegment(<expr>.toString())`.
 *  - Mixed segments like `users-{id}` interpolate into a single
 *    `addPathSegment("users-$id")` call (OkHttp percent-encodes the
 *    full segment, so reserved characters in the value stay scoped to
 *    that segment).
 *  - Query params route through `URLEncoding.addScalar` /
 *    `URLEncoding.addArray` so style+explode is uniform.
 */
export function buildUrlStmts(
  pathStr: string,
  located: ReadonlyArray<LocatedParam>,
): ReadonlyArray<KtStmt> {
  const pathParams = paramsAt(located, "path");
  const queryParams = paramsAt(located, "query");

  const stmts: KtStmt[] = [
    ktVar("urlBuilder", ktCall(ktMember(ktIdent("baseUrl"), "newBuilder"), [])),
  ];
  for (const seg of splitPathSegments(pathStr)) {
    stmts.push(
      ktExprStmt(
        ktCall(ktMember(ktIdent("urlBuilder"), "addPathSegment"), [
          ktArg(segmentExpr(seg, pathParams)),
        ]),
      ),
    );
  }
  for (const p of queryParams) {
    stmts.push(buildQueryStmt(p));
  }
  stmts.push(
    ktVal("url", ktCall(ktMember(ktIdent("urlBuilder"), "build"), [])),
  );
  return stmts;
}

interface ParamPart {
  expr: KtExpr;
  isString: boolean;
}

function segmentExpr(
  seg: string,
  pathParams: ReadonlyArray<IR.ParameterObject>,
): KtExpr {
  const parts: Array<string | ParamPart> = parseTemplatedSegment(
    seg,
    pathParams,
  ).map((p) =>
    p.kind === "literal"
      ? p.text
      : {
          expr: ktIdent(paramIdent(p.param ? p.param.name : p.name)),
          isString: p.param?.schema.type === "string",
        },
  );

  if (parts.length === 0) return ktStr("");
  if (parts.length === 1 && typeof parts[0] === "string")
    return ktStr(parts[0]);
  if (parts.length === 1) {
    const only = parts[0] as ParamPart;
    return only.isString
      ? only.expr
      : ktCall(ktMember(only.expr, "toString"), []);
  }
  return ktInterp(parts.map((p) => (typeof p === "string" ? p : p.expr)));
}

function buildQueryStmt(p: IR.ParameterObject): KtStmt {
  const id = paramIdent(p.name);
  const isArray = p.schema.type === "array";
  const helper = isArray ? "addArray" : "addScalar";
  const args: KtCallArg[] = [
    ktArg(ktIdent("urlBuilder")),
    ktArg(ktStr(p.name)),
    ktArg(ktIdent(id)),
  ];
  if (isArray) {
    args.push(
      ktArg(ktIdent(`QueryStyle.${queryStyleEntry(p.style)}`), "style"),
    );
    args.push(ktArg(ktBoolLit(p.explode ?? true), "explode"));
  }
  return ktExprStmt(ktCall(ktMember(ktIdent("URLEncoding"), helper), args));
}

function queryStyleEntry(style: IR.ParameterObject["style"]): string {
  switch (style) {
    case "spaceDelimited":
      return "SPACE_DELIMITED";
    case "pipeDelimited":
      return "PIPE_DELIMITED";
    default:
      return "FORM";
  }
}
