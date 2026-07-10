import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftThrowStatement extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.ThrowStatement;
}

export function createThrowStatement(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftThrowStatement {
  return {
    expression,
    kind: SwiftNodeKind.ThrowStatement,
    leadingComments,
    trailingComments,
  };
}
