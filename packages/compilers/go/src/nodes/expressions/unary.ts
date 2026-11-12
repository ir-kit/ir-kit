import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export type GoUnaryOperator = "+" | "-" | "!" | "^" | "&" | "*" | "<-";

export interface GoUnaryExpression extends GoNodeBase {
  kind: GoNodeKind.UnaryExpression;
  operand: GoExpression;
  operator: GoUnaryOperator;
}

export function createUnaryExpression(
  operator: GoUnaryOperator,
  operand: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoUnaryExpression {
  return {
    kind: GoNodeKind.UnaryExpression,
    leadingComments,
    operand,
    operator,
    trailingComments,
  };
}
