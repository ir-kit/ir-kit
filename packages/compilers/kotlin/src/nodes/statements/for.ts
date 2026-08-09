import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinStatement } from '../statement';

export interface KotlinForStatement extends KotlinNodeBase {
  body: KotlinStatement;
  iterable: KotlinExpression;
  kind: KotlinNodeKind.ForStatement;
  variables: ReadonlyArray<string>;
}

export function createForStatement(
  variables: ReadonlyArray<string>,
  iterable: KotlinExpression,
  body: KotlinStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinForStatement {
  return {
    body,
    iterable,
    kind: KotlinNodeKind.ForStatement,
    leadingComments,
    trailingComments,
    variables,
  };
}
