import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export type JavaBinaryOperator =
  // Arithmetic
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  // Comparison
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  // Logical
  | "&&"
  | "||"
  // Bitwise
  | "&"
  | "|"
  | "^"
  | "<<"
  | ">>"
  | ">>>";

export interface JavaBinaryExpression extends JavaNodeBase {
  kind: JavaNodeKind.BinaryExpression;
  left: JavaExpression;
  operator: JavaBinaryOperator;
  right: JavaExpression;
}

export function createBinaryExpression(
  left: JavaExpression,
  operator: JavaBinaryOperator,
  right: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaBinaryExpression {
  return {
    kind: JavaNodeKind.BinaryExpression,
    leadingComments,
    left,
    operator,
    right,
    trailingComments,
  };
}
