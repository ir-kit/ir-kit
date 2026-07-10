import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftAwaitExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.AwaitExpression;
}

export function createAwaitExpression(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAwaitExpression {
  return {
    expression,
    kind: SwiftNodeKind.AwaitExpression,
    leadingComments,
    trailingComments,
  };
}
