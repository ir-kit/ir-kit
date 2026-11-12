import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinPrefixOperator } from "../shared.js";

export interface KotlinPrefixUnaryExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.PrefixUnaryExpression;
  operand: KotlinExpression;
  operator: KotlinPrefixOperator;
}

export function createPrefixUnaryExpression(
  operator: KotlinPrefixOperator,
  operand: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinPrefixUnaryExpression {
  return {
    kind: KotlinNodeKind.PrefixUnaryExpression,
    leadingComments,
    operand,
    operator,
    trailingComments,
  };
}
