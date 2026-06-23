import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaThrowStatement extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.ThrowStatement;
}

export function createThrowStatement(
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaThrowStatement {
  return {
    expression,
    kind: JavaNodeKind.ThrowStatement,
    leadingComments,
    trailingComments,
  };
}
