import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftInfixOperatorExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.InfixOperatorExpression;
  left: SwiftExpression;
  operator: string;
  right: SwiftExpression;
}

export function createInfixOperatorExpression(
  left: SwiftExpression,
  operator: string,
  right: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftInfixOperatorExpression {
  return {
    kind: SwiftNodeKind.InfixOperatorExpression,
    leadingComments,
    left,
    operator,
    right,
    trailingComments,
  };
}
