import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';

export interface GoBlock extends GoNodeBase {
  kind: GoNodeKind.Block;
  statements: ReadonlyArray<GoStatement>;
}

export function createBlock(
  statements: ReadonlyArray<GoStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoBlock {
  return {
    kind: GoNodeKind.Block,
    leadingComments,
    statements,
    trailingComments,
  };
}
