import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoBreakStatement extends GoNodeBase {
  kind: GoNodeKind.BreakStatement;
}

export function createBreakStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoBreakStatement {
  return {
    kind: GoNodeKind.BreakStatement,
    leadingComments,
    trailingComments,
  };
}
