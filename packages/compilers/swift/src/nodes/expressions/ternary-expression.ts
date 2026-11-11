import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

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
