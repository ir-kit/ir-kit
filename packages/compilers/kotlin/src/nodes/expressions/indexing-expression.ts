import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

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
