import { $ } from "@hey-api/openapi-ts";
import type { WalkedOperation } from "@ir-kit/k6-gen";

import type { Expr } from "./ast-helpers.js";

export type ChainMode = "sequential" | "batch";

/** One chained `.<name>(<args>)` call. */
interface Segment {
  name: string;
  args: Expr[];
}

/**
 * Build the `flow().step("...", ...).step(...)` or `flow().batch(...)` expression
 * for a given set of operations. Lives next to the scaffolder so the renderer is
 * isolated from CLI / wizard concerns.
 */
export function buildFlowExpression(
  ops: ReadonlyArray<WalkedOperation>,
  chain: ChainMode,
): Expr {
  if (ops.length === 0) return flow([step("health", $.func())]);
  if (chain === "batch" && ops.length > 1) return batchFlow(ops);
  return flow(
    ops.map((op) => step(op.id, $.func().do($.stmt(apiCall(op, false))))),
  );
}

/**
 * `flow().batch("fan-out", () => ({ a: api.async.a(), b: api.async.b() }))`.
 * Uses the `async` namespace + Promise.all-style batch for true parallel HTTP.
 */
function batchFlow(ops: ReadonlyArray<WalkedOperation>): Expr {
  const calls = $.object().pretty();
  for (const op of ops) calls.prop(op.id, apiCall(op, true));
  return flow([
    {
      name: "batch",
      args: [$.literal("fan-out"), $.func().do($.return(calls))],
    },
  ]);
}

/** `flow().<segment>(...)…` */
function flow(segments: ReadonlyArray<Segment>): Expr {
  let expr = $("flow").call();
  for (const { name, args } of segments) expr = expr.attr(name).call(...args);
  return expr;
}

function step(label: string, body: Expr): Segment {
  return { name: "step", args: [$.literal(label), body] };
}

/** `api.foo(arg1, arg2)` or `api.async.foo(arg1, arg2)`. */
function apiCall(op: WalkedOperation, asyncNs: boolean) {
  const api = asyncNs ? $("api").attr("async") : $("api");
  return api.attr(op.id).call(...placeholderArgs(op));
}

/**
 * Emit placeholder positional args matching the generated client's signature:
 * path params (as named identifiers), query (object literal), body (object literal).
 */
function placeholderArgs(op: WalkedOperation): Expr[] {
  const args: Expr[] = op.pathParams.map((p) => $(p.name));
  if (op.queryParams.length > 0) args.push($.object());
  if (op.body) args.push($.object());
  return args;
}
