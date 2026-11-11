import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

export type SwiftAccessorSpecifier = "didSet" | "get" | "set" | "willSet";

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
