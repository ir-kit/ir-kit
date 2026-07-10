import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftPrefixOperatorExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.PrefixOperatorExpression;
  operand: SwiftExpression;
  operator: string;
}

export function createPrefixOperatorExpression(
  operator: string,
  operand: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPrefixOperatorExpression {
  return {
    kind: SwiftNodeKind.PrefixOperatorExpression,
    leadingComments,
    operand,
    operator,
    trailingComments,
  };
}
