import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftPrefixOperatorExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.PrefixOperatorExpression;
  operator: string;
}

export function createPrefixOperatorExpression(
  operator: string,
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPrefixOperatorExpression {
  return {
    expression,
    kind: SwiftNodeKind.PrefixOperatorExpression,
    leadingComments,
    operator,
    trailingComments,
  };
}
