import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

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
