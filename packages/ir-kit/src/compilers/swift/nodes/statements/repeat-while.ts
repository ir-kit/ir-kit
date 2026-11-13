import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

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
