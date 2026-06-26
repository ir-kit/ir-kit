import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoBreakStatement extends GoNodeBase {
  kind: GoNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoBreakStatement {
  return {
    kind: GoNodeKind.BreakStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
