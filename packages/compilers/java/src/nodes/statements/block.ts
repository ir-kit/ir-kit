import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';

export interface JavaBlock extends JavaNodeBase {
  kind: JavaNodeKind.Block;
  statements: ReadonlyArray<JavaStatement>;
}

export function createBlock(
  statements: ReadonlyArray<JavaStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaBlock {
  return {
    kind: JavaNodeKind.Block,
    leadingComments,
    statements,
    trailingComments,
  };
}
