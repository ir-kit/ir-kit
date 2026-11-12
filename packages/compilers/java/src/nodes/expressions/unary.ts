import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export type JavaUnaryOperator =
  // Prefix
  "+" | "-" | "!" | "~" | "++" | "--";

export interface JavaUnaryExpression extends JavaNodeBase {
  kind: JavaNodeKind.UnaryExpression;
  operand: JavaExpression;
  operator: JavaUnaryOperator;
  postfix?: boolean;
}

export function createUnaryExpression(
  operator: JavaUnaryOperator,
  operand: JavaExpression,
  postfix: boolean = false,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaUnaryExpression {
  return {
    kind: JavaNodeKind.UnaryExpression,
    leadingComments,
    operand,
    operator,
    postfix,
    trailingComments,
  };
}
