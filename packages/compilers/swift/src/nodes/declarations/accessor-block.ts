import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export type SwiftAccessorSpecifier = 'didSet' | 'get' | 'set' | 'willSet';

export type SwiftAccessor = {
  accessorSpecifier: SwiftAccessorSpecifier;
  body: ReadonlyArray<SwiftStatement>;
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
