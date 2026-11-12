import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";

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
