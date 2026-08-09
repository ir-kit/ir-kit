import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';

export interface KotlinExpressionStatement extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinExpressionStatement {
  return {
    expression,
    kind: KotlinNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
