import { safeIdent } from "@ahmedrowaihi/codegen-core";
import { $, type TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import type ts from "typescript";

import {
  schemaToTypeNode,
  toIdent,
  type WalkedOperation,
  walkOperations,
} from "../ir/index.js";
import { GENERATED_HEADER, printDslNodes } from "../print.js";
import { formatTypeImport } from "./type-import.js";

type Expr = TsDsl<ts.Expression>;
type TypeExpr = TsDsl<ts.TypeNode>;

export interface ClientEmitOptions {
  defaultBaseUrl?: string;
  schemaNames?: ReadonlyArray<string>;
}

export function emitClientFile(
  paths: IR.PathsObject | undefined,
  opts: ClientEmitOptions = {},
): string {
  const defaultUrl = JSON.stringify(opts.defaultBaseUrl ?? "");
  const typeNames = (opts.schemaNames ?? []).map(safeIdent);
  const typeImport = formatTypeImport(typeNames);
  const preamble = `${GENERATED_HEADER}
import * as http from "k6/http";
import { applyMiddlewareHeaders } from "@ahmedrowaihi/k6/runtime";
${typeImport}

declare const __ENV: Record<string, string | undefined>;

export const BASE_URL: string =
  (typeof __ENV !== "undefined" && __ENV.BASE_URL) || ${defaultUrl};

export interface CallOpts {
  headers?: Record<string, string>;
  tags?: Record<string, string>;
}

function __buildQuery(p: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null) continue;
    const key = encodeURIComponent(k);
    if (Array.isArray(v)) {
      for (const item of v) parts.push(\`\${key}=\${encodeURIComponent(String(item))}\`);
    } else {
      parts.push(\`\${key}=\${encodeURIComponent(String(v))}\`);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

function __parseJson(res: http.Response): unknown {
  return res.body ? JSON.parse(res.body as string) : undefined;
}

function __mergeTags(op: string, extra: Record<string, string> | undefined): Record<string, string> {
  return { operation: op, ...(extra ?? {}) };
}
`;

  const decls = Array.from(walkOperations(paths), operationFn);
  return `${preamble}\n${printDslNodes(decls)}`;
}

function operationFn(op: WalkedOperation): TsDsl<ts.FunctionDeclaration> {
  const returnType: TypeExpr = op.successSchema
    ? schemaToTypeNode(op.successSchema)
    : $.type("void");

  return $.func(toIdent(op.id), (fn) => {
    for (const p of op.pathParams) {
      fn.param(
        toIdent(p.name),
        (param) => void param.type(schemaToTypeNode(p.schema)),
      );
    }
    if (op.queryParams.length) {
      const allOptional = op.queryParams.every((p) => !p.required);
      fn.param("query", (param) => {
        let queryType = $.type.object();
        for (const p of op.queryParams) {
          const propType = schemaToTypeNode(p.schema);
          queryType = queryType.prop(p.name, (pr) => {
            const out = pr.type(propType);
            return p.required ? out : out.optional();
          });
        }
        const out = param.type(queryType);
        return allOptional ? out.optional() : out;
      });
    }
    if (op.body) {
      fn.param("body", (param) => {
        const out = param.type(schemaToTypeNode(op.body!.schema));
        return op.body!.required ? out : out.optional();
      });
    }
    fn.param("opts", (param) => void param.optional().type($.type("CallOpts")));

    fn.returns(returnType);

    fn.do($.const("url").assign(urlExpression(op)));
    fn.do($.const("headers").assign(headersExpression(op)));
    fn.do($.const("res").assign(callExpression(op)));
    if (op.successSchema) {
      fn.do($.return($("__parseJson").call($("res")).as(returnType)));
    }
  }).export();
}

function urlExpression(op: WalkedOperation): Expr {
  const parts = op.path.split(/(\{[^}]+\})/g).filter((s) => s.length > 0);
  let expr: Expr = $("BASE_URL");
  for (const part of parts) {
    const m = part.match(/^\{([^}]+)\}$/);
    expr = $.binary(expr, "+", m ? $(toIdent(m[1])) : $.literal(part));
  }
  if (op.queryParams.length) {
    expr = $.binary(
      expr,
      "+",
      $("__buildQuery").call(
        $("query").as(
          $.type("Record").generic($.type("string")).generic($.type("unknown")),
        ),
      ),
    );
  }
  return expr;
}

function headersExpression(op: WalkedOperation): Expr {
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

function callExpression(op: WalkedOperation): Expr {
  const httpAttr = METHOD_TO_HTTP_ATTR[op.method] ?? op.method;
  const callParams = $.object()
    .prop(
      "tags",
      $("__mergeTags").call(
        $.literal(op.id),
        $("opts").attr("tags").optional(),
      ),
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
