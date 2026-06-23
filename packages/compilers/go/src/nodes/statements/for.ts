import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import { createBlock, type GoBlock } from './block';

export interface GoForStatement extends GoNodeBase {
  body: GoBlock;
  condition?: GoExpression;
  init?: GoStatement;
  kind: GoNodeKind.ForStatement;
  post?: GoStatement;
}

export function createForStatement(
  body: ReadonlyArray<GoStatement>,
  init?: GoStatement,
  condition?: GoExpression,
  post?: GoStatement,
): GoForStatement {
  return {
    body: createBlock(body),
    condition,
    init,
    kind: GoNodeKind.ForStatement,
    post,
  };
}
