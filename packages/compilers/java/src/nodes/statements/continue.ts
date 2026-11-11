import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaContinueStatement extends JavaNodeBase {
  kind: JavaNodeKind.ContinueStatement;
  label?: string;
}

export function createContinueStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
  label?: string,
): JavaContinueStatement {
  return {
    kind: JavaNodeKind.ContinueStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
