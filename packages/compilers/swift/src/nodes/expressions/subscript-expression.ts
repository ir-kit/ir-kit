import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

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
