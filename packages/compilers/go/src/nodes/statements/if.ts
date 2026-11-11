import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import { createBlock, type GoBlock } from './block';

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
