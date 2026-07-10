import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftCondition } from './condition';

export interface SwiftWhileStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  conditions: ReadonlyArray<SwiftCondition>;
  kind: SwiftNodeKind.WhileStatement;
}

export function createWhileStatement(
  conditions: ReadonlyArray<SwiftCondition>,
  body: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftWhileStatement {
  return {
    body,
    conditions,
    kind: SwiftNodeKind.WhileStatement,
    leadingComments,
    trailingComments,
  };
}
