import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftBreakStatement extends SwiftNodeBase {
  kind: SwiftNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftBreakStatement {
  return {
    kind: SwiftNodeKind.BreakStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
