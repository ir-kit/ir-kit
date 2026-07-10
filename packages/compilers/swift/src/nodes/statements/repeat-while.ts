import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export interface SwiftRepeatWhileStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  condition: SwiftExpression;
  kind: SwiftNodeKind.RepeatWhileStatement;
}

export function createRepeatWhileStatement(
  body: ReadonlyArray<SwiftStatement>,
  condition: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftRepeatWhileStatement {
  return {
    body,
    condition,
    kind: SwiftNodeKind.RepeatWhileStatement,
    leadingComments,
    trailingComments,
  };
}
