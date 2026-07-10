import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftSubscriptExpression extends SwiftNodeBase {
  arguments: ReadonlyArray<SwiftExpression>;
  calledExpression: SwiftExpression;
  kind: SwiftNodeKind.SubscriptExpression;
}

export function createSubscriptExpression(
  calledExpression: SwiftExpression,
  args: ReadonlyArray<SwiftExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSubscriptExpression {
  return {
    arguments: args,
    calledExpression,
    kind: SwiftNodeKind.SubscriptExpression,
    leadingComments,
    trailingComments,
  };
}
