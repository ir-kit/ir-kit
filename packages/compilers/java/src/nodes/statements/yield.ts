import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaYieldStatement extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.YieldStatement;
}

export function createYieldStatement(
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaYieldStatement {
  return {
    expression,
    kind: JavaNodeKind.YieldStatement,
    leadingComments,
    trailingComments,
  };
}
