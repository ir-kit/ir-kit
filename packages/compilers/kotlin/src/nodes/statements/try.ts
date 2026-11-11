import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinCatchClause } from '../shared';
import type { KotlinBlock } from './block';

export interface KotlinTryExpression extends KotlinNodeBase {
  body: KotlinBlock;
  catches?: ReadonlyArray<KotlinCatchClause>;
  finallyBlock?: KotlinBlock;
  kind: KotlinNodeKind.TryExpression;
}

export function createTryExpression(
  body: KotlinBlock,
  catches?: ReadonlyArray<KotlinCatchClause>,
  finallyBlock?: KotlinBlock,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinTryExpression {
  return {
    body,
    catches,
    finallyBlock,
    kind: KotlinNodeKind.TryExpression,
    leadingComments,
    trailingComments,
  };
}
