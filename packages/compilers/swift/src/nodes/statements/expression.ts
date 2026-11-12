import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftExpressionStatement extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftExpressionStatement {
  return {
    expression,
    kind: SwiftNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
