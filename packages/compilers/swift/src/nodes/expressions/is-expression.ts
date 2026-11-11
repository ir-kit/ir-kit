import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftIsExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.IsExpression;
  type: SwiftType;
}

export function createIsExpression(
  expression: SwiftExpression,
  type: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIsExpression {
  return {
    expression,
    kind: SwiftNodeKind.IsExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
