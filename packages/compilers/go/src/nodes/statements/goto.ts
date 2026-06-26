import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoGotoStatement extends GoNodeBase {
  kind: GoNodeKind.GotoStatement;
  label: string;
}

export function createGotoStatement(
  label: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoGotoStatement {
  return {
    kind: GoNodeKind.GotoStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
