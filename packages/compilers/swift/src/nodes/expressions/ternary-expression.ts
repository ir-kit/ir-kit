import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftTernaryExpression extends SwiftNodeBase {
  condition: SwiftExpression;
  elseExpression: SwiftExpression;
  kind: SwiftNodeKind.TernaryExpression;
  thenExpression: SwiftExpression;
}

export function createTernaryExpression(
  condition: SwiftExpression,
  thenExpression: SwiftExpression,
  elseExpression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTernaryExpression {
  return {
    condition,
    elseExpression,
    kind: SwiftNodeKind.TernaryExpression,
    leadingComments,
    thenExpression,
    trailingComments,
  };
}
