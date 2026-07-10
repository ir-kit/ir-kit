import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftPostfixOperatorExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.PostfixOperatorExpression;
  operand: SwiftExpression;
  operator: string;
}

export function createPostfixOperatorExpression(
  operand: SwiftExpression,
  operator: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPostfixOperatorExpression {
  return {
    kind: SwiftNodeKind.PostfixOperatorExpression,
    leadingComments,
    operand,
    operator,
    trailingComments,
  };
}
