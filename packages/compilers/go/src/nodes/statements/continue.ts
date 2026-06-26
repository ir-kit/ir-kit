import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoContinueStatement extends GoNodeBase {
  kind: GoNodeKind.ContinueStatement;
  label?: string;
}

export function createContinueStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoContinueStatement {
  return {
    kind: GoNodeKind.ContinueStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
