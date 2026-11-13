import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinCatchClause } from "../shared.js";
import type { KotlinBlock } from "./block.js";

export interface KotlinTryExpression extends KotlinNodeBase {
  body: KotlinBlock;
  catches?: ReadonlyArray<KotlinCatchClause>;
  finallyBlock?: KotlinBlock;
  kind: KotlinNodeKind.TryExpression;
}

export function createTryExpression(
  body: KotlinBlock,
  catches?: ReadonlyArray<KotlinCatchClause>,
  finallyBlock?: KotlinBlock,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinTryExpression {
  return {
    body,
    catches,
    finallyBlock,
    kind: KotlinNodeKind.TryExpression,
    leadingComments,
    trailingComments,
  };
}
