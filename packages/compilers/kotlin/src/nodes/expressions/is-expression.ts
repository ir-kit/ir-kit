import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinType } from '../type';

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
