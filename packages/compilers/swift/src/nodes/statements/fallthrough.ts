import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftFallthroughStatement extends SwiftNodeBase {
  kind: SwiftNodeKind.FallthroughStatement;
}

export function createFallthroughStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftFallthroughStatement {
  return {
    kind: SwiftNodeKind.FallthroughStatement,
    leadingComments,
    trailingComments,
  };
}
