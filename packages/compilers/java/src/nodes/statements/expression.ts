import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaExpressionStatement extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaExpressionStatement {
  return {
    expression,
    kind: JavaNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
