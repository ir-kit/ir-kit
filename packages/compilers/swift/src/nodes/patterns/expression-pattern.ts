import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftExpressionPattern extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.ExpressionPattern;
}

export function createExpressionPattern(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftExpressionPattern {
  return {
    expression,
    kind: SwiftNodeKind.ExpressionPattern,
    leadingComments,
    trailingComments,
  };
}
