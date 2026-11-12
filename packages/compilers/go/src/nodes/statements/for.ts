import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import { createBlock, type GoBlock } from "./block.js";

export interface GoForStatement extends GoNodeBase {
  body: GoBlock;
  condition?: GoExpression;
  init?: GoStatement;
  kind: GoNodeKind.ForStatement;
  post?: GoStatement;
}

export function createForStatement(
  init: GoStatement | undefined,
  condition: GoExpression | undefined,
  post: GoStatement | undefined,
  body: ReadonlyArray<GoStatement>,
): GoForStatement {
  return {
    body: createBlock(body),
    condition,
    init,
    kind: GoNodeKind.ForStatement,
    post,
  };
}
