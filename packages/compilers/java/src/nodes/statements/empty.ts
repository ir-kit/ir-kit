import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaEmptyStatement extends JavaNodeBase {
  kind: JavaNodeKind.EmptyStatement;
}

export function createEmptyStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaEmptyStatement {
  return {
    kind: JavaNodeKind.EmptyStatement,
    leadingComments,
    trailingComments,
  };
}
