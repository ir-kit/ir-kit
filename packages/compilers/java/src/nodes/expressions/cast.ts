import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaCastExpression extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.CastExpression;
  type: JavaExpression;
}

export function createCastExpression(
  type: JavaExpression,
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaCastExpression {
  return {
    expression,
    kind: JavaNodeKind.CastExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
