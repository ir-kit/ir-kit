import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';

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
