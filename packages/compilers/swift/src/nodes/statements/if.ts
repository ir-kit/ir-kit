import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';
import type { SwiftCondition } from './condition';

export interface SwiftIfStatement extends SwiftNodeBase {
  condition: ReadonlyArray<SwiftCondition> | SwiftCondition;
  elseBody?: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.IfStatement;
  thenBody: ReadonlyArray<SwiftStatement>;
}

export function createIfStatement(
  condition: ReadonlyArray<SwiftCondition> | SwiftCondition,
  thenBody: ReadonlyArray<SwiftStatement>,
  elseBody?: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIfStatement {
  return {
    condition,
    elseBody,
    kind: SwiftNodeKind.IfStatement,
    leadingComments,
    thenBody,
    trailingComments,
  };
}
