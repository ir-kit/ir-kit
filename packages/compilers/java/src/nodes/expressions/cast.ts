import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaCastExpression extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.CastExpression;
  type: JavaExpression;
}

export function createCastExpression(
  type: JavaExpression,
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaCastExpression {
  return {
    expression,
    kind: JavaNodeKind.CastExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
