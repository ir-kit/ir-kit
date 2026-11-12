import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftSelectorExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.SelectorExpression;
  target: SwiftExpression;
}

export function createSelectorExpression(
  target: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSelectorExpression {
  return {
    kind: SwiftNodeKind.SelectorExpression,
    leadingComments,
    target,
    trailingComments,
  };
}
