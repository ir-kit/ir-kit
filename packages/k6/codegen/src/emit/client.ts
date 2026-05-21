import type { TsDsl } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";
import { fromHeyApi } from "@ir-kit/openapi";
import ts from "typescript";

import {
  schemaToTypeNode,
  toIdent,
  type WalkedOperation,
  walkOperations,
} from "../ir/index.js";
import { GENERATED_HEADER, printStatements } from "../print.js";
import { clientPreambleStatements } from "./client-preamble.js";
import { bodyArg, urlExpression } from "./operation-expressions.js";

type TypeExpr = TsDsl<ts.TypeNode>;

const f = ts.factory;

/** Namespace alias for type imports — generated client emits `T.Pet`. */
const TYPE_NAMESPACE = "T";

function typed(schema: IR.SchemaObject): TypeExpr {
  return schemaToTypeNode(fromHeyApi(schema), {
    typeNamespace: TYPE_NAMESPACE,
  });
}

function typeNodeFor(op: WalkedOperation): ts.TypeNode {
  return op.successSchema
    ? (typed(op.successSchema).toAst() as ts.TypeNode)
    : f.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
}

export interface ClientEmitOptions {
  defaultBaseUrl?: string;
  schemaNames?: ReadonlyArray<string>;
}

/**
 * Emit the generated client file. Per-op output is one-line wrappers around
 * preamble helpers (`call`/`callAsync`/`buildSpec`); see `client-preamble.ts`
 * for the helpers themselves.
 */
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
  const syncDecls = operations.map(syncOperationFn);
  const asyncDecls = operations.map(asyncOperationFn);
  const specAssignments = operations.map(emitSpecAssignment);
  const asyncExport = asyncNamespaceExport(operations);

  return printStatements(
    [...preamble, ...syncDecls, ...asyncDecls, ...specAssignments, asyncExport],
    GENERATED_HEADER,
  );
}

/** `export function getPet(...): Pet { return call<Pet>(...); }` */
function syncOperationFn(op: WalkedOperation): ts.Statement {
  return operationFnDecl(op, /* async */ false, /* exported */ true);
}

/** `async function getPet_async(...): Promise<Pet> { return callAsync<Pet>(...); }` */
function asyncOperationFn(op: WalkedOperation): ts.Statement {
  return operationFnDecl(op, /* async */ true, /* exported */ false);
}

function operationFnDecl(
  op: WalkedOperation,
  asyncCall: boolean,
  exported: boolean,
): ts.FunctionDeclaration {
  const returnTypeNode = typeNodeFor(op);
  const fnReturnType = asyncCall
    ? f.createTypeReferenceNode("Promise", [returnTypeNode])
    : returnTypeNode;

  const modifiers: ts.Modifier[] = [];
  if (exported) modifiers.push(f.createModifier(ts.SyntaxKind.ExportKeyword));
  if (asyncCall) modifiers.push(f.createModifier(ts.SyntaxKind.AsyncKeyword));

  return f.createFunctionDeclaration(
    modifiers,
    undefined,
    exported ? toIdent(op.id) : asyncInternalName(op),
    undefined,
    buildParamDeclarations(op),
    fnReturnType,
    f.createBlock(
      [f.createReturnStatement(callExpression(op, returnTypeNode, asyncCall))],
      true,
    ),
  );
}

function asyncInternalName(op: WalkedOperation): string {
  return `${toIdent(op.id)}_async`;
}

/** `call<Pet>("GET", url, "getPet", null, opts)` or the async variant. */
function callExpression(
  op: WalkedOperation,
  returnType: ts.TypeNode,
  asyncCall: boolean,
): ts.Expression {
  return f.createCallExpression(
    f.createIdentifier(asyncCall ? "callAsync" : "call"),
    [returnType],
    [
      f.createStringLiteral(op.method.toUpperCase()),
      urlExpression(op).toAst() as ts.Expression,
      f.createStringLiteral(op.id),
      bodyArg(op).toAst() as ts.Expression,
      f.createIdentifier("opts"),
    ],
  );
}

/**
 * `getPet.spec = (args, opts?) => buildSpec("GET", url, "getPet", null, opts);`
 *
 * Lets users drop to raw `http.request(spec.method, spec.url, spec.body,
 * spec.params)` with all the wiring done — keeping access to the raw Response
 * for status checks, timings, `http.batch()` composition, etc.
 */
function emitSpecAssignment(op: WalkedOperation): ts.Statement {
  const buildSpecCall = f.createCallExpression(
    f.createIdentifier("buildSpec"),
    undefined,
    [
      f.createStringLiteral(op.method.toUpperCase()),
      urlExpression(op).toAst() as ts.Expression,
      f.createStringLiteral(op.id),
      bodyArg(op).toAst() as ts.Expression,
      f.createIdentifier("opts"),
    ],
  );

  const arrow = f.createArrowFunction(
    undefined,
    undefined,
    buildParamDeclarations(op),
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    buildSpecCall,
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
 * Shared parameter list for sync/async/spec emit — all three present the same
 * signature to the user. (path params, optional query, optional body, opts).
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
