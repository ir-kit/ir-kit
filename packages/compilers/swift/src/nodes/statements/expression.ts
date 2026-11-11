import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftExpressionStatement extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftExpressionStatement {
  return {
    expression,
    kind: SwiftNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
