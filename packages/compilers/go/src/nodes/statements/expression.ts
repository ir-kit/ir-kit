import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export interface GoExpressionStatement extends GoNodeBase {
  expression: GoExpression;
  kind: GoNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoExpressionStatement {
  return {
    expression,
    kind: GoNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
