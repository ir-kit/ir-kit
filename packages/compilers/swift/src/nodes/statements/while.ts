import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";
import type { SwiftCondition } from "./condition.js";

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
