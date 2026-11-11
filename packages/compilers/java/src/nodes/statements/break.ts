import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaBreakStatement extends JavaNodeBase {
  kind: JavaNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
  label?: string,
): JavaBreakStatement {
  return {
    kind: JavaNodeKind.BreakStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
