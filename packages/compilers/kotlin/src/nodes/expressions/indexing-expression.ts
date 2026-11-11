import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';

export interface KotlinIndexingExpression extends KotlinNodeBase {
  indices: ReadonlyArray<KotlinExpression>;
  kind: KotlinNodeKind.IndexingExpression;
  receiver: KotlinExpression;
}

export function createIndexingExpression(
  receiver: KotlinExpression,
  indices: ReadonlyArray<KotlinExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinIndexingExpression {
  return {
    indices,
    kind: KotlinNodeKind.IndexingExpression,
    leadingComments,
    receiver,
    trailingComments,
  };
}
