import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaReturnStatement extends JavaNodeBase {
  expression?: JavaExpression;
  kind: JavaNodeKind.ReturnStatement;
}

export function createReturnStatement(
  expression?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaReturnStatement {
  return {
    expression,
    kind: JavaNodeKind.ReturnStatement,
    leadingComments,
    trailingComments,
  };
}
