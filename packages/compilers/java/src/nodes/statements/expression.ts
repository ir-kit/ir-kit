import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaExpressionStatement extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaExpressionStatement {
  return {
    expression,
    kind: JavaNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
