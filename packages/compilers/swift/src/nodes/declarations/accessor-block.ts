import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export type SwiftAccessorKind = 'didSet' | 'get' | 'set' | 'willSet';

export type SwiftAccessor = {
  body: ReadonlyArray<SwiftStatement>;
  kind: SwiftAccessorKind;
};

export interface SwiftAccessorBlock extends SwiftNodeBase {
  accessors: ReadonlyArray<SwiftAccessor>;
  kind: SwiftNodeKind.AccessorBlock;
}

export function createAccessorBlock(
  accessors: ReadonlyArray<SwiftAccessor>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAccessorBlock {
  return {
    accessors,
    kind: SwiftNodeKind.AccessorBlock,
    leadingComments,
    trailingComments,
  };
}
