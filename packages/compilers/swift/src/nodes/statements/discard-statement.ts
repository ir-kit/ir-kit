import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftDiscardStatement extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.DiscardStatement;
}

export function createDiscardStatement(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDiscardStatement {
  return {
    expression,
    kind: SwiftNodeKind.DiscardStatement,
    leadingComments,
    trailingComments,
  };
}
