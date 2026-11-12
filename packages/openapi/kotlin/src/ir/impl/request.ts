import { HTTP_METHOD_LITERAL, type HttpMethod } from "@ir-kit/openapi";

import {
  type KtStmt,
  ktArg,
  ktCall,
  ktExprStmt,
  ktIdent,
  ktIntLit,
  ktMember,
  ktNull,
  ktStr,
  ktVal,
} from "../../ast/index.js";

/** Methods OkHttp rejects without a request body. */
const REQUIRES_BODY: ReadonlySet<string> = new Set(["POST", "PUT", "PATCH"]);

/**
 * Request builder for the URL. When the operation has a body, the body
 * builder sets the method together with it; otherwise the method is set
 * here, with an empty body for verbs OkHttp requires one for.
 *
 *   val builder = Request.Builder().url(url).method("GET", null)
 */
export function buildRequestStmts(
  method: HttpMethod,
  hasBody: boolean,
): ReadonlyArray<KtStmt> {
  const verb = HTTP_METHOD_LITERAL[method];
  const withUrl = ktCall(
    ktMember(ktCall(ktIdent("Request.Builder"), []), "url"),
    [ktArg(ktIdent("url"))],
  );
  if (hasBody) return [ktVal("builder", withUrl)];
  const emptyBody = REQUIRES_BODY.has(verb)
    ? ktCall(
        ktMember(
          ktCall(ktIdent("ByteArray"), [ktArg(ktIntLit(0))]),
          "toRequestBody",
        ),
        [],
      )
    : ktNull;
  return [
    ktVal(
      "builder",
      ktCall(ktMember(withUrl, "method"), [
        ktArg(ktStr(verb)),
        ktArg(emptyBody),
      ]),
    ),
  ];
}

/** Convenience for the body builder to re-set the method when a
 *  RequestBody is produced. */
export function setMethodWithBody(
  method: HttpMethod,
  bodyExpr: import("../../ast/index.js").KtExpr,
): KtStmt {
  return ktExprStmt(
    ktCall(ktMember(ktIdent("builder"), "method"), [
      ktArg(ktStr(HTTP_METHOD_LITERAL[method])),
      ktArg(bodyExpr),
    ]),
  );
}
