import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinStatement } from "../statement.js";

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
