import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinBinaryOperator } from '../shared';

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
