import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

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
