import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinPostfixOperator } from '../shared';

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
