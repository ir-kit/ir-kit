import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export type GoUnaryOperator = '+' | '-' | '!' | '^' | '&' | '*' | '<-' | '~';

export interface GoUnaryExpression extends GoNodeBase {
  kind: GoNodeKind.UnaryExpression;
  operand: GoExpression;
  operator: GoUnaryOperator;
}

export function createUnaryExpression(
  operator: GoUnaryOperator,
  operand: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoUnaryExpression {
  return {
    kind: GoNodeKind.UnaryExpression,
    leadingComments,
    operand,
    operator,
    trailingComments,
  };
}
