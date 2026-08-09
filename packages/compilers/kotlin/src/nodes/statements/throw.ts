import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';

export interface KotlinThrowStatement extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.ThrowStatement;
}

export function createThrowStatement(
  expression: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinThrowStatement {
  return {
    expression,
    kind: KotlinNodeKind.ThrowStatement,
    leadingComments,
    trailingComments,
  };
}
