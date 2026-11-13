import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinType } from "../type.js";

export interface KotlinIsExpression extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.IsExpression;
  negated?: boolean;
  type: KotlinType;
}

export function createIsExpression(
  expression: KotlinExpression,
  type: KotlinType,
  negated?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinIsExpression {
  return {
    expression,
    kind: KotlinNodeKind.IsExpression,
    leadingComments,
    negated,
    trailingComments,
    type,
  };
}
