import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import { createBlock, type GoBlock } from "./block.js";

export interface GoIfStatement extends GoNodeBase {
  condition: GoExpression;
  elseBlock?: GoBlock | GoIfStatement;
  initStatement?: GoStatement;
  kind: GoNodeKind.IfStatement;
  thenBlock: GoBlock;
}

export function createIfStatement(
  condition: GoExpression,
  thenBlock: ReadonlyArray<GoStatement>,
  elseBlock?: ReadonlyArray<GoStatement> | GoIfStatement,
  initStatement?: GoStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoIfStatement {
  return {
    condition,
    elseBlock: elseBlock instanceof Array ? createBlock(elseBlock) : elseBlock,
    initStatement,
    kind: GoNodeKind.IfStatement,
    leadingComments,
    thenBlock: createBlock(thenBlock),
    trailingComments,
  };
}
