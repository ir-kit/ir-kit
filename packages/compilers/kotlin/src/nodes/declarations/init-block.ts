import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinStatement } from "../statement.js";

export interface KotlinInitBlock extends KotlinNodeBase {
  body: ReadonlyArray<KotlinStatement>;
  kind: KotlinNodeKind.InitBlock;
}

export function createInitBlock(
  body: ReadonlyArray<KotlinStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinInitBlock {
  return {
    body,
    kind: KotlinNodeKind.InitBlock,
    leadingComments,
    trailingComments,
  };
}
