import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaAssertStatement extends JavaNodeBase {
  condition: JavaExpression;
  kind: JavaNodeKind.AssertStatement;
  message?: JavaExpression;
}

export function createAssertStatement(
  condition: JavaExpression,
  message?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaAssertStatement {
  return {
    condition,
    kind: JavaNodeKind.AssertStatement,
    leadingComments,
    message,
    trailingComments,
  };
}
