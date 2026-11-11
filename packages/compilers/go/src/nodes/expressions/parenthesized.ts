import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoParenthesizedExpression extends GoNodeBase {
  expression: GoExpression;
  kind: GoNodeKind.ParenthesizedExpression;
}

export function createParenthesizedExpression(
  expression: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoParenthesizedExpression {
  return {
    expression,
    kind: GoNodeKind.ParenthesizedExpression,
    leadingComments,
    trailingComments,
  };
}
