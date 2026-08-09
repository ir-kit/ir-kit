import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinStatement } from '../statement';

export interface KotlinInitBlock extends KotlinNodeBase {
  body: ReadonlyArray<KotlinStatement>;
  kind: KotlinNodeKind.InitBlock;
}

export function createInitBlock(
  body: ReadonlyArray<KotlinStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinInitBlock {
  return { body, kind: KotlinNodeKind.InitBlock, leadingComments, trailingComments };
}
