import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaAssertStatement extends JavaNodeBase {
  condition: JavaExpression;
  kind: JavaNodeKind.AssertStatement;
  message?: JavaExpression;
}

export function createAssertStatement(
  condition: JavaExpression,
  message?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaAssertStatement {
  return {
    condition,
    kind: JavaNodeKind.AssertStatement,
    leadingComments,
    message,
    trailingComments,
  };
}
