import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaTernaryExpression extends JavaNodeBase {
  condition: JavaExpression;
  elseExpr: JavaExpression;
  kind: JavaNodeKind.TernaryExpression;
  thenExpr: JavaExpression;
}

export function createTernaryExpression(
  condition: JavaExpression,
  thenExpr: JavaExpression,
  elseExpr: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaTernaryExpression {
  return {
    condition,
    elseExpr,
    kind: JavaNodeKind.TernaryExpression,
    leadingComments,
    thenExpr,
    trailingComments,
  };
}
