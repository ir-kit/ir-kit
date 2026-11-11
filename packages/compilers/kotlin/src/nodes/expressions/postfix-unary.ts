import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinPostfixOperator } from "../shared.js";

export interface KotlinPostfixUnaryExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.PostfixUnaryExpression;
  operand: KotlinExpression;
  operator: KotlinPostfixOperator;
}

export function createPostfixUnaryExpression(
  operand: KotlinExpression,
  operator: KotlinPostfixOperator,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinPostfixUnaryExpression {
  return {
    kind: KotlinNodeKind.PostfixUnaryExpression,
    leadingComments,
    operand,
    operator,
    trailingComments,
  };
}
