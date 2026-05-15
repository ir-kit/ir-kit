import { $, type TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import type ts from "typescript";

import {
  schemaToTypeNode,
  toIdent,
  type WalkedOperation,
  walkOperations,
} from "../ir/index.js";
import { GENERATED_HEADER, printStatements } from "../print.js";
import { clientPreambleStatements } from "./client-preamble.js";
import {
  callExpression,
  headersExpression,
  urlExpression,
} from "./operation-expressions.js";

type TypeExpr = TsDsl<ts.TypeNode>;

/** Namespace alias for type imports — generated client emits `T.Pet`. */
const TYPE_NAMESPACE = "T";

/** Map a schema to a TS type node, prefixed with the type namespace. */
function typed(schema: IR.SchemaObject): TypeExpr {
  return schemaToTypeNode(schema, { typeNamespace: TYPE_NAMESPACE });
}

export interface ClientEmitOptions {
  defaultBaseUrl?: string;
  schemaNames?: ReadonlyArray<string>;
}

export function emitClientFile(
  paths: IR.PathsObject | undefined,
  opts: ClientEmitOptions = {},
): string {
  const preamble = clientPreambleStatements({
    defaultBaseUrl: opts.defaultBaseUrl ?? "",
    typeNamespace: TYPE_NAMESPACE,
    hasTypes: (opts.schemaNames?.length ?? 0) > 0,
  });
  const ops = Array.from(walkOperations(paths), operationFn).map(
    (n) => n.toAst() as ts.Statement,
  );
  return printStatements([...preamble, ...ops], GENERATED_HEADER);
}

function operationFn(op: WalkedOperation): TsDsl<ts.FunctionDeclaration> {
  const returnType: TypeExpr = op.successSchema
    ? typed(op.successSchema)
    : $.type("void");

  return $.func(toIdent(op.id), (fn) => {
    addPathParams(fn, op);
    addQueryParam(fn, op);
    addBodyParam(fn, op);
    fn.param("opts", (param) => void param.optional().type($.type("CallOpts")));

    fn.returns(returnType);

    fn.do($.const("url").assign(urlExpression(op)));
    fn.do($.const("headers").assign(headersExpression(op)));
    fn.do($.const("res").assign(callExpression(op)));
    if (op.successSchema) {
      fn.do($.return($("parseJson").call($("res")).as(returnType)));
    }
  }).export();
}

type FnBuilder = Parameters<NonNullable<Parameters<typeof $.func>[1]>>[0];

function addPathParams(fn: FnBuilder, op: WalkedOperation): void {
  for (const p of op.pathParams) {
    fn.param(toIdent(p.name), (param) => void param.type(typed(p.schema)));
  }
}

function addQueryParam(fn: FnBuilder, op: WalkedOperation): void {
  if (!op.queryParams.length) return;
  const allOptional = op.queryParams.every((p) => !p.required);
  fn.param("query", (param) => {
    let queryType = $.type.object();
    for (const p of op.queryParams) {
      const propType = typed(p.schema);
      queryType = queryType.prop(p.name, (pr) => {
        const out = pr.type(propType);
        return p.required ? out : out.optional();
      });
    }
    const out = param.type(queryType);
    return allOptional ? out.optional() : out;
  });
}

function addBodyParam(fn: FnBuilder, op: WalkedOperation): void {
  if (!op.body) return;
  const body = op.body;
  fn.param("body", (param) => {
    const out = param.type(typed(body.schema));
    return body.required ? out : out.optional();
  });
}
