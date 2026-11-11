import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftPostfixOperatorExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.PostfixOperatorExpression;
  operator: string;
}

export function createPostfixOperatorExpression(
  expression: SwiftExpression,
  operator: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPostfixOperatorExpression {
  return {
    expression,
    kind: SwiftNodeKind.PostfixOperatorExpression,
    leadingComments,
    operator,
    trailingComments,
  };
}
