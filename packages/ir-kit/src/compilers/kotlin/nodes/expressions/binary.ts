import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinBinaryOperator } from "../shared.js";

export interface KotlinBinaryExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.BinaryExpression;
  left: KotlinExpression;
  operator: KotlinBinaryOperator;
  right: KotlinExpression;
}

export function createBinaryExpression(
  left: KotlinExpression,
  operator: KotlinBinaryOperator,
  right: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinBinaryExpression {
  return {
    kind: KotlinNodeKind.BinaryExpression,
    leadingComments,
    left,
    operator,
    right,
    trailingComments,
  };
}
