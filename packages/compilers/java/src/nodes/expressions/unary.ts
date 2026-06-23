import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export type JavaUnaryOperator =
  // Prefix
  '+' | '-' | '!' | '~' | '++' | '--';

export interface JavaUnaryExpression extends JavaNodeBase {
  kind: JavaNodeKind.UnaryExpression;
  operand: JavaExpression;
  operator: JavaUnaryOperator;
  postfix?: boolean;
}

export function createUnaryExpression(
  operator: JavaUnaryOperator,
  operand: JavaExpression,
  postfix: boolean = false,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaUnaryExpression {
  return {
    kind: JavaNodeKind.UnaryExpression,
    leadingComments,
    operand,
    operator,
    postfix,
    trailingComments,
  };
}
