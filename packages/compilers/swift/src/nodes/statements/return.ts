import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftReturnStatement extends SwiftNodeBase {
  expression?: SwiftExpression;
  kind: SwiftNodeKind.ReturnStatement;
}

export function createReturnStatement(
  expression?: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftReturnStatement {
  return {
    expression,
    kind: SwiftNodeKind.ReturnStatement,
    leadingComments,
    trailingComments,
  };
}
