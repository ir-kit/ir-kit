import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import { createBlock,type GoBlock } from './block';

export interface GoSelectCase {
  body: GoBlock;
  comm?: GoStatement;
}

export interface GoSelectStatement extends GoNodeBase {
  cases: ReadonlyArray<GoSelectCase>;
  kind: GoNodeKind.SelectStatement;
}

export function createSelectCase(
  body: ReadonlyArray<GoStatement>,
  comm?: GoStatement,
): GoSelectCase {
  return {
    body: createBlock(body),
    comm,
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
