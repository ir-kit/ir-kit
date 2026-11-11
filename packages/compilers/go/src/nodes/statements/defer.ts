import type { GoNodeBase } from "../base.js";
import type { GoCallExpression } from "../expressions/call.js";
import { GoNodeKind } from "../kinds.js";

export interface GoDeferStatement extends GoNodeBase {
  call: GoCallExpression;
  kind: GoNodeKind.DeferStatement;
}

export function createDeferStatement(call: GoCallExpression): GoDeferStatement {
  return {
    call,
    kind: GoNodeKind.DeferStatement,
  };
}
