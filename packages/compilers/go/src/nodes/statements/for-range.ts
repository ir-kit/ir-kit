import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import { createBlock, type GoBlock } from './block';

export interface GoForRangeStatement extends GoNodeBase {
  body: GoBlock;
  iterable: GoExpression;
  kind: GoNodeKind.ForRangeStatement;
  targets?: ReadonlyArray<string>;
  useShortVar?: boolean;
}

export function createForRangeStatement(
  iterable: GoExpression,
  body: ReadonlyArray<GoStatement>,
  targets?: ReadonlyArray<string>,
  useShortVar: boolean = true,
): GoForRangeStatement {
  return {
    body: createBlock(body),
    iterable,
    kind: GoNodeKind.ForRangeStatement,
    targets,
    useShortVar,
  };
}
