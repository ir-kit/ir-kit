import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinParenthesizedExpression extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.ParenthesizedExpression;
}

export function createParenthesizedExpression(
  expression: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinParenthesizedExpression {
  return {
    expression,
    kind: KotlinNodeKind.ParenthesizedExpression,
    leadingComments,
    trailingComments,
  };
}
