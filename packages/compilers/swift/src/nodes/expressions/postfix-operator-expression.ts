import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftPostfixOperatorExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.PostfixOperatorExpression;
  operator: string;
}

export function createPostfixOperatorExpression(
  expression: SwiftExpression,
  operator: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPostfixOperatorExpression {
  return {
    expression,
    kind: SwiftNodeKind.PostfixOperatorExpression,
    leadingComments,
    operator,
    trailingComments,
  };
}
