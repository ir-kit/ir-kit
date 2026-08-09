import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinStatement } from '../statement';

export interface KotlinWhileStatement extends KotlinNodeBase {
  body: KotlinStatement;
  condition: KotlinExpression;
  isDoWhile?: boolean;
  kind: KotlinNodeKind.WhileStatement;
}

export function createWhileStatement(
  condition: KotlinExpression,
  body: KotlinStatement,
  isDoWhile?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinWhileStatement {
  return {
    body,
    condition,
    isDoWhile,
    kind: KotlinNodeKind.WhileStatement,
    leadingComments,
    trailingComments,
  };
}
