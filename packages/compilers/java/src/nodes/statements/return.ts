import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaReturnStatement extends JavaNodeBase {
  expression?: JavaExpression;
  kind: JavaNodeKind.ReturnStatement;
}

export function createReturnStatement(
  expression?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaReturnStatement {
  return {
    expression,
    kind: JavaNodeKind.ReturnStatement,
    leadingComments,
    trailingComments,
  };
}
