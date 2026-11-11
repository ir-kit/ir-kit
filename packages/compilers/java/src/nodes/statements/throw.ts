import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaThrowStatement extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.ThrowStatement;
}

export function createThrowStatement(
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaThrowStatement {
  return {
    expression,
    kind: JavaNodeKind.ThrowStatement,
    leadingComments,
    trailingComments,
  };
}
