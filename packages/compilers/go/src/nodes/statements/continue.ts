import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoContinueStatement extends GoNodeBase {
  kind: GoNodeKind.ContinueStatement;
}

export function createContinueStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoContinueStatement {
  return {
    kind: GoNodeKind.ContinueStatement,
    leadingComments,
    trailingComments,
  };
}
