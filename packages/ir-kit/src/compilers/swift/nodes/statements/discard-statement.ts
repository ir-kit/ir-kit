import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftDiscardStatement extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.DiscardStatement;
}

export function createDiscardStatement(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDiscardStatement {
  return {
    expression,
    kind: SwiftNodeKind.DiscardStatement,
    leadingComments,
    trailingComments,
  };
}
