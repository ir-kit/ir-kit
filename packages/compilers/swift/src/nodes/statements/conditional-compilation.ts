import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export interface SwiftConditionalCompilation extends SwiftNodeBase {
  condition: string;
  elseBody?: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.ConditionalCompilation;
  thenBody: ReadonlyArray<SwiftStatement>;
}

export function createConditionalCompilation(
  condition: string,
  thenBody: ReadonlyArray<SwiftStatement>,
  elseBody?: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftConditionalCompilation {
  return {
    condition,
    elseBody,
    kind: SwiftNodeKind.ConditionalCompilation,
    leadingComments,
    thenBody,
    trailingComments,
  };
}
