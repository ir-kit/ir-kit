import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftCondition } from './condition';

export interface SwiftGuardStatement extends SwiftNodeBase {
  conditions: ReadonlyArray<SwiftCondition>;
  elseBody: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.GuardStatement;
}

export function createGuardStatement(
  conditions: ReadonlyArray<SwiftCondition>,
  elseBody: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftGuardStatement {
  return {
    conditions,
    elseBody,
    kind: SwiftNodeKind.GuardStatement,
    leadingComments,
    trailingComments,
  };
}
