import { $, type TsDsl } from "@hey-api/openapi-ts";
import type ts from "typescript";

import { toIdent, type WalkedOperation } from "../ir/index.js";

type Expr = TsDsl<ts.Expression>;

/** OpenAPI verb → k6 `http` namespace attribute (`delete` → `del`). */
const METHOD_TO_HTTP_ATTR: Record<string, string> = {
  get: "get",
  post: "post",
  put: "put",
  patch: "patch",
  delete: "del",
  head: "head",
  options: "options",
};

const METHODS_WITH_BODY = new Set([
  "post",
  "put",
  "patch",
  "delete",
  "options",
]);

/** `getBaseUrl(DEFAULT_BASE_URL) + "/path" + param + "/sub" (+ "?" + qs)`. */
export function urlExpression(op: WalkedOperation): Expr {
  let expr: Expr = $("getBaseUrl").call($("DEFAULT_BASE_URL"));
  for (const part of op.path.split(/(\{[^}]+\})/g).filter((s) => s.length)) {
    const m = part.match(/^\{([^}]+)\}$/);
    expr = $.binary(expr, "+", m ? $(toIdent(m[1])) : $.literal(part));
  }
  if (op.queryParams.length) expr = $.binary(expr, "+", buildQueryCall());
  return expr;
}

function buildQueryCall(): Expr {
  return $("buildQuery").call(
    $("query").as(
      $.type("Record").generic($.type("string")).generic($.type("unknown")),
    ),
  );
}

/** `applyMiddlewareHeaders({ "Content-Type": ..., ...opts?.headers })`. */
export function headersExpression(op: WalkedOperation): Expr {
  let obj = $.object();
  if (op.body) {
    obj = obj.prop(
      "Content-Type",
      $.literal(op.body.mediaType || "application/json"),
    );
  }
  obj = obj.spread($("opts").attr("headers").optional().or($.object()));
  return $("applyMiddlewareHeaders").call(obj);
}

/** `http.<verb>(url, [body], { tags, headers })`. */
export function callExpression(op: WalkedOperation): Expr {
  const httpAttr = METHOD_TO_HTTP_ATTR[op.method] ?? op.method;
  const callParams = $.object()
    .prop(
      "tags",
      $("mergeTags").call($.literal(op.id), $("opts").attr("tags").optional()),
    )
    .prop("headers", $("headers"));

  const args: Expr[] = [$("url")];
  if (METHODS_WITH_BODY.has(op.method)) {
    args.push(
      op.body ? $("JSON").attr("stringify").call($("body")) : $.literal(null),
    );
  }
  args.push(callParams);

  return $("http")
    .attr(httpAttr)
    .call(...args);
}
