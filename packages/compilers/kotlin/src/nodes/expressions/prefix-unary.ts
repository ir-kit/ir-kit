import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinPrefixOperator } from '../shared';

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
