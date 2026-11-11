import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftCondition } from './condition';

export interface SwiftGuardStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  conditions: ReadonlyArray<SwiftCondition>;
  kind: SwiftNodeKind.GuardStatement;
}

export function createGuardStatement(
  conditions: ReadonlyArray<SwiftCondition>,
  body: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftGuardStatement {
  return {
    body,
    conditions,
    kind: SwiftNodeKind.GuardStatement,
    leadingComments,
    trailingComments,
  };
}
