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

/** Methods k6 forms with `http.<verb>(url, body, params)`. */
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
  obj = obj.spread($("opts").attr("headers").optional());
  return $("applyMiddlewareHeaders").call(obj);
}

/**
 * Params object passed to k6's http call:
 *
 * ```ts
 * {
 *   ...applyMiddlewareParams(),
 *   ...opts,
 *   headers,
 *   tags: mergeTags("opId", opts?.tags),
 * }
 * ```
 *
 * Order ensures middleware params (auth) seed defaults, user opts override,
 * and computed headers/tags always win — they're the merged results.
 */
export function paramsExpression(op: WalkedOperation): Expr {
  return $.object()
    .spread($("applyMiddlewareParams").call())
    .spread($("opts"))
    .prop("headers", $("headers"))
    .prop(
      "tags",
      $("mergeTags").call($.literal(op.id), $("opts").attr("tags").optional()),
    );
}

/** Body argument for verb calls — currently JSON-stringify; multipart TODO. */
export function bodyArg(op: WalkedOperation): Expr {
  return op.body
    ? $("JSON").attr("stringify").call($("body"))
    : $.literal(null);
}

/** `http.<verb>(url, [body], params)` — sync variant. */
export function syncCallExpression(op: WalkedOperation): Expr {
  const httpAttr = METHOD_TO_HTTP_ATTR[op.method] ?? op.method;
  const args: Expr[] = [$("url")];
  if (METHODS_WITH_BODY.has(op.method)) args.push(bodyArg(op));
  args.push($("params"));
  return $("http")
    .attr(httpAttr)
    .call(...args);
}

/** `http.asyncRequest(method, url, body, params)` — async variant. */
export function asyncCallExpression(op: WalkedOperation): Expr {
  const args: Expr[] = [
    $.literal(op.method.toUpperCase()),
    $("url"),
    METHODS_WITH_BODY.has(op.method) ? bodyArg(op) : $.literal(null),
    $("params"),
  ];
  return $("http")
    .attr("asyncRequest")
    .call(...args);
}
