import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";
import type { SwiftCondition } from "./condition.js";

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
