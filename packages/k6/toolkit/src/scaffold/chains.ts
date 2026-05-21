import type { WalkedOperation } from "@ir-kit/k6-gen";
import ts from "typescript";

const f = ts.factory;

export type ChainMode = "sequential" | "batch";

/**
 * Build the `flow().step("...", ...).step(...)` or `flow().batch(...)` expression
 * for a given set of operations. Lives next to the scaffolder so the renderer is
 * isolated from CLI / wizard concerns.
 */
export function buildFlowExpression(
  ops: ReadonlyArray<WalkedOperation>,
  chain: ChainMode,
): ts.Expression {
  if (ops.length === 0) return placeholderFlow();
  if (chain === "batch" && ops.length > 1) return batchFlow(ops);
  return sequentialFlow(ops);
}

/** `flow().step("name", () => {})` for the empty case. */
function placeholderFlow(): ts.Expression {
  return chain(flowCall(), [step("health", arrowFn([]))]);
}

/**
 * `flow().step("first", () => api.first(...)).step("second", () => api.second(...))`
 * Each step calls the op with placeholder args (path params named after the op param,
 * body undefined — user fills these in).
 */
function sequentialFlow(ops: ReadonlyArray<WalkedOperation>): ts.Expression {
  const stepCalls = ops.map((op) =>
    step(op.id, arrowFn([apiCallStmt(op, /* asyncNs */ false)])),
  );
  return chain(flowCall(), stepCalls);
}

/**
 * `flow().batch("page", () => ({ a: api.async.a(), b: api.async.b() }))`.
 * Uses the `async` namespace + Promise.all-style batch for true parallel HTTP.
 */
function batchFlow(ops: ReadonlyArray<WalkedOperation>): ts.Expression {
  const props = ops.map((op) =>
    f.createPropertyAssignment(op.id, apiCallExpr(op, /* asyncNs */ true)),
  );
  const objectExpr = f.createParenthesizedExpression(
    f.createObjectLiteralExpression(props, true),
  );
  const arrow = f.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    objectExpr,
  );
  return chain(flowCall(), [
    f.createCallExpression(f.createIdentifier("batch"), undefined, [
      f.createStringLiteral("fan-out"),
      arrow,
    ]),
  ]);
}

function flowCall(): ts.CallExpression {
  return f.createCallExpression(f.createIdentifier("flow"), undefined, []);
}

/**
 * Compose `base.method1(...args1).method2(...args2)` from a base expression and
 * a list of "call segments" (each `<name>(<args>)` becomes one chained method).
 */
function chain(
  base: ts.Expression,
  calls: ReadonlyArray<ts.CallExpression>,
): ts.Expression {
  return calls.reduce<ts.Expression>((acc, call) => {
    const name = call.expression as ts.Identifier;
    return f.createCallExpression(
      f.createPropertyAccessExpression(acc, name),
      undefined,
      [...call.arguments],
    );
  }, base);
}

function step(label: string, body: ts.Expression): ts.CallExpression {
  return f.createCallExpression(f.createIdentifier("step"), undefined, [
    f.createStringLiteral(label),
    body,
  ]);
}

function arrowFn(stmts: ts.Statement[]): ts.ArrowFunction {
  return f.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    f.createBlock(stmts, true),
  );
}

function apiCallStmt(op: WalkedOperation, asyncNs: boolean): ts.Statement {
  return f.createExpressionStatement(apiCallExpr(op, asyncNs));
}

/** `api.foo(arg1, arg2)` or `api.async.foo(arg1, arg2)`. */
function apiCallExpr(op: WalkedOperation, asyncNs: boolean): ts.Expression {
  const callee = asyncNs
    ? f.createPropertyAccessExpression(
        f.createPropertyAccessExpression(
          f.createIdentifier("api"),
          f.createIdentifier("async"),
        ),
        f.createIdentifier(op.id),
      )
    : f.createPropertyAccessExpression(
        f.createIdentifier("api"),
        f.createIdentifier(op.id),
      );

  return f.createCallExpression(callee, undefined, placeholderArgs(op));
}

/**
 * Emit placeholder positional args matching the generated client's signature:
 * path params (as named identifiers), query (object literal), body (object literal).
 */
function placeholderArgs(op: WalkedOperation): ts.Expression[] {
  const args: ts.Expression[] = [];
  for (const p of op.pathParams) {
    args.push(f.createIdentifier(/* TODO */ p.name));
  }
  if (op.queryParams.length > 0) {
    args.push(f.createObjectLiteralExpression([], false));
  }
  if (op.body) {
    args.push(f.createObjectLiteralExpression([], false));
  }
  return args;
}
