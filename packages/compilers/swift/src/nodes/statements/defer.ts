import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export interface SwiftDeferStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.DeferStatement;
}

export function createDeferStatement(
  body: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDeferStatement {
  return {
    body,
    kind: SwiftNodeKind.DeferStatement,
    leadingComments,
    trailingComments,
  };
}
