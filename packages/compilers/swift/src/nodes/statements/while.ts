import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export interface SwiftWhileStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  condition: SwiftExpression;
  kind: SwiftNodeKind.WhileStatement;
}

export function createWhileStatement(
  condition: SwiftExpression,
  body: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftWhileStatement {
  return {
    body,
    condition,
    kind: SwiftNodeKind.WhileStatement,
    leadingComments,
    trailingComments,
  };
}
