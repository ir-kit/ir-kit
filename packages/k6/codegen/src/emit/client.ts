import { $, type TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import ts from "typescript";

import {
  schemaToTypeNode,
  toIdent,
  type WalkedOperation,
  walkOperations,
} from "../ir/index.js";
import { GENERATED_HEADER, printStatements } from "../print.js";
import { clientPreambleStatements } from "./client-preamble.js";
import {
  asyncCallExpression,
  bodyArg,
  headersExpression,
  paramsExpression,
  syncCallExpression,
  urlExpression,
} from "./operation-expressions.js";

type TypeExpr = TsDsl<ts.TypeNode>;

const f = ts.factory;

/** Namespace alias for type imports — generated client emits `T.Pet`. */
const TYPE_NAMESPACE = "T";

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

  const operations = Array.from(walkOperations(paths));
  const syncDecls = operations.map(
    (op) => syncOperationFn(op).toAst() as ts.Statement,
  );
  const asyncDecls = operations.map(
    (op) => asyncOperationFn(op).toAst() as ts.Statement,
  );
  const specAssignments = operations.map(emitSpecAssignment);
  const asyncExport = asyncNamespaceExport(operations);

  return printStatements(
    [...preamble, ...syncDecls, ...asyncDecls, ...specAssignments, asyncExport],
    GENERATED_HEADER,
  );
}

/** Sync operation: `export function getPet(...): Pet { ... }`. */
function syncOperationFn(op: WalkedOperation): TsDsl<ts.FunctionDeclaration> {
  const returnType: TypeExpr = op.successSchema
    ? typed(op.successSchema)
    : $.type("void");

  return $.func(toIdent(op.id), (fn) => {
    addParams(fn, op);
    fn.returns(returnType);
    fn.do($.const("url").assign(urlExpression(op)));
    fn.do($.const("headers").assign(headersExpression(op)));
    fn.do($.const("params").assign(paramsExpression(op, $("headers"))));
    fn.do($.const("res").assign(syncCallExpression(op)));
    if (op.successSchema) {
      fn.do($.return($("parseJson").call($("res")).as(returnType)));
    }
  }).export();
}

/**
 * Module-internal async sibling: `async function getPet_async(...): Promise<Pet> { ... }`.
 * Not exported — referenced from the `async` namespace literal below.
 */
function asyncOperationFn(op: WalkedOperation): TsDsl<ts.FunctionDeclaration> {
  const returnType: TypeExpr = op.successSchema
    ? typed(op.successSchema)
    : $.type("void");
  const promiseReturn = $.type("Promise").generic(returnType);

  return $.func(asyncInternalName(op), (fn) => {
    fn.async();
    addParams(fn, op);
    fn.returns(promiseReturn);
    fn.do($.const("url").assign(urlExpression(op)));
    fn.do($.const("headers").assign(headersExpression(op)));
    fn.do($.const("params").assign(paramsExpression(op, $("headers"))));
    fn.do($.const("res").assign($.await(asyncCallExpression(op))));
    if (op.successSchema) {
      fn.do($.return($("parseJson").call($("res")).as(returnType)));
    }
  });
}

function asyncInternalName(op: WalkedOperation): string {
  return `${toIdent(op.id)}_async`;
}

/**
 * Attach `.spec(args) => { method, url, body, params }` to each generated op.
 *
 * Lets users drop to raw `http.request(spec.method, spec.url, spec.body, spec.params)`
 * with the URL templating, op tagging, header injection, and middleware-params
 * wiring done for them — preserving access to the raw Response for status checks,
 * timings, headers, `http.batch()` composition, etc.
 *
 * Emits: `getPet.spec = (id, opts?) => ({ method: "GET", url: ..., body: null, params: ... });`
 */
function emitSpecAssignment(op: WalkedOperation): ts.Statement {
  const params = buildParamDeclarations(op);

  const specObj = f.createObjectLiteralExpression(
    [
      f.createPropertyAssignment(
        "method",
        f.createStringLiteral(op.method.toUpperCase()),
      ),
      f.createPropertyAssignment(
        "url",
        urlExpression(op).toAst() as ts.Expression,
      ),
      f.createPropertyAssignment("body", bodyArg(op).toAst() as ts.Expression),
      f.createPropertyAssignment(
        "params",
        paramsExpression(op, headersExpression(op)).toAst() as ts.Expression,
      ),
    ],
    true,
  );

  const arrow = f.createArrowFunction(
    undefined,
    undefined,
    params,
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    f.createParenthesizedExpression(specObj),
  );

  return f.createExpressionStatement(
    f.createAssignment(
      f.createPropertyAccessExpression(
        f.createIdentifier(toIdent(op.id)),
        f.createIdentifier("spec"),
      ),
      arrow,
    ),
  );
}

/**
 * Build the parameter list shared by all three variants (sync function, async
 * sibling, spec arrow). Mirrors `addParams` but returns the AST directly so the
 * arrow function in `emitSpecAssignment` can attach them without going through
 * the DSL's function builder.
 */
function buildParamDeclarations(
  op: WalkedOperation,
): ts.ParameterDeclaration[] {
  const out: ts.ParameterDeclaration[] = [];

  for (const p of op.pathParams) {
    out.push(
      f.createParameterDeclaration(
        undefined,
        undefined,
        toIdent(p.name),
        undefined,
        typed(p.schema).toAst() as ts.TypeNode,
      ),
    );
  }

  if (op.queryParams.length) {
    const allOptional = op.queryParams.every((p) => !p.required);
    const members = op.queryParams.map((p) =>
      f.createPropertySignature(
        undefined,
        p.name,
        p.required ? undefined : f.createToken(ts.SyntaxKind.QuestionToken),
        typed(p.schema).toAst() as ts.TypeNode,
      ),
    );
    out.push(
      f.createParameterDeclaration(
        undefined,
        undefined,
        "query",
        allOptional ? f.createToken(ts.SyntaxKind.QuestionToken) : undefined,
        f.createTypeLiteralNode(members),
      ),
    );
  }

  if (op.body) {
    out.push(
      f.createParameterDeclaration(
        undefined,
        undefined,
        "body",
        op.body.required
          ? undefined
          : f.createToken(ts.SyntaxKind.QuestionToken),
        typed(op.body.schema).toAst() as ts.TypeNode,
      ),
    );
  }

  out.push(
    f.createParameterDeclaration(
      undefined,
      undefined,
      "opts",
      f.createToken(ts.SyntaxKind.QuestionToken),
      f.createTypeReferenceNode("CallOpts"),
    ),
  );

  return out;
}

/**
 * Emit:
 *
 * ```ts
 * export const async = {
 *   getPet: getPet_async,
 *   addPet: addPet_async,
 *   // ...
 * };
 * ```
 */
function asyncNamespaceExport(
  operations: ReadonlyArray<WalkedOperation>,
): ts.Statement {
  const props = operations.map((op) =>
    f.createPropertyAssignment(
      toIdent(op.id),
      f.createIdentifier(asyncInternalName(op)),
    ),
  );

  const literal = f.createObjectLiteralExpression(props, true);

  return f.createVariableStatement(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    f.createVariableDeclarationList(
      [f.createVariableDeclaration("async", undefined, undefined, literal)],
      ts.NodeFlags.Const,
    ),
  );
}

type FnBuilder = Parameters<NonNullable<Parameters<typeof $.func>[1]>>[0];

function addParams(fn: FnBuilder, op: WalkedOperation): void {
  for (const p of op.pathParams) {
    fn.param(toIdent(p.name), (param) => void param.type(typed(p.schema)));
  }
  if (op.queryParams.length) {
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
  if (op.body) {
    const body = op.body;
    fn.param("body", (param) => {
      const out = param.type(typed(body.schema));
      return body.required ? out : out.optional();
    });
  }
  fn.param("opts", (param) => void param.optional().type($.type("CallOpts")));
}
