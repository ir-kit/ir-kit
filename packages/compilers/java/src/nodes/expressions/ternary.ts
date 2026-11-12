import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaTernaryExpression extends JavaNodeBase {
  condition: JavaExpression;
  elseExpr: JavaExpression;
  kind: JavaNodeKind.TernaryExpression;
  thenExpr: JavaExpression;
}

export function createTernaryExpression(
  condition: JavaExpression,
  thenExpr: JavaExpression,
  elseExpr: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaTernaryExpression {
  return {
    condition,
    elseExpr,
    kind: JavaNodeKind.TernaryExpression,
    leadingComments,
    thenExpr,
    trailingComments,
  };
}
