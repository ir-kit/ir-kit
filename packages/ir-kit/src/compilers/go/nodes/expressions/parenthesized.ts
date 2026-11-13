import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export interface GoParenthesizedExpression extends GoNodeBase {
  expression: GoExpression;
  kind: GoNodeKind.ParenthesizedExpression;
}

export function createParenthesizedExpression(
  expression: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoParenthesizedExpression {
  return {
    expression,
    kind: GoNodeKind.ParenthesizedExpression,
    leadingComments,
    trailingComments,
  };
}
