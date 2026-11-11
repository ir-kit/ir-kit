import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftContinueStatement extends SwiftNodeBase {
  kind: SwiftNodeKind.ContinueStatement;
  label?: string;
}

export function createContinueStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftContinueStatement {
  return {
    kind: SwiftNodeKind.ContinueStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
