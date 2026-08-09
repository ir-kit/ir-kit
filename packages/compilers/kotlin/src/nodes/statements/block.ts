import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinStatement } from '../statement';

export interface KotlinBlock extends KotlinNodeBase {
  kind: KotlinNodeKind.Block;
  statements: ReadonlyArray<KotlinStatement>;
}

export function createBlock(
  statements: ReadonlyArray<KotlinStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinBlock {
  return {
    kind: KotlinNodeKind.Block,
    leadingComments,
    statements,
    trailingComments,
  };
}
