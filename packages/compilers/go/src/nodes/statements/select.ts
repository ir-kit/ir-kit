import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import { createBlock, type GoBlock } from './block';

export interface GoSelectCase {
  body: GoBlock;
  communication?: GoStatement;
}

export interface GoSelectStatement extends GoNodeBase {
  cases: ReadonlyArray<GoSelectCase>;
  kind: GoNodeKind.SelectStatement;
}

export function createSelectCase(
  body: ReadonlyArray<GoStatement>,
  communication?: GoStatement,
): GoSelectCase {
  return {
    body: createBlock(body),
    communication,
  };
}

export function createSelectStatement(
  cases: ReadonlyArray<GoSelectCase>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoSelectStatement {
  return {
    cases,
    kind: GoNodeKind.SelectStatement,
    leadingComments,
    trailingComments,
  };
}
