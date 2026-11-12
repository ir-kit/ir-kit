import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftReturnStatement extends SwiftNodeBase {
  expression?: SwiftExpression;
  kind: SwiftNodeKind.ReturnStatement;
}

export function createReturnStatement(
  expression?: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftReturnStatement {
  return {
    expression,
    kind: SwiftNodeKind.ReturnStatement,
    leadingComments,
    trailingComments,
  };
}
