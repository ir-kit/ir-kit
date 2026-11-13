import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftThrowStatement extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.ThrowStatement;
}

export function createThrowStatement(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftThrowStatement {
  return {
    expression,
    kind: SwiftNodeKind.ThrowStatement,
    leadingComments,
    trailingComments,
  };
}
