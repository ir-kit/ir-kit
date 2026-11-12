import type { GoNodeBase } from "../base.js";
import type { GoCallExpression } from "../expressions/call.js";
import { GoNodeKind } from "../kinds.js";

export interface GoGoStatement extends GoNodeBase {
  expression: GoCallExpression;
  kind: GoNodeKind.GoStatement;
}

export function createGoStatement(expression: GoCallExpression): GoGoStatement {
  return {
    expression,
    kind: GoNodeKind.GoStatement,
  };
}
