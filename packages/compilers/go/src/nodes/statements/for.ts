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
