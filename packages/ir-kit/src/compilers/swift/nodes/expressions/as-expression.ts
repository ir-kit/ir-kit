import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftAsExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.AsExpression;
  questionOrExclamationMark?: "!" | "?";
  type: SwiftType;
}

export function createAsExpression(
  expression: SwiftExpression,
  type: SwiftType,
  questionOrExclamationMark?: "!" | "?",
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAsExpression {
  return {
    expression,
    kind: SwiftNodeKind.AsExpression,
    leadingComments,
    questionOrExclamationMark,
    trailingComments,
    type,
  };
}
