import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";
import type { SwiftCondition } from "./condition.js";

export interface SwiftIfStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  conditions: ReadonlyArray<SwiftCondition>;
  elseBody?: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.IfStatement;
}

export function createIfStatement(
  conditions: ReadonlyArray<SwiftCondition>,
  body: ReadonlyArray<SwiftStatement>,
  elseBody?: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIfStatement {
  return {
    body,
    conditions,
    elseBody,
    kind: SwiftNodeKind.IfStatement,
    leadingComments,
    trailingComments,
  };
}
