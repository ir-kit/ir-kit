import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftInfixOperatorExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.InfixOperatorExpression;
  leftOperand: SwiftExpression;
  operator: string;
  rightOperand: SwiftExpression;
}

export function createInfixOperatorExpression(
  leftOperand: SwiftExpression,
  operator: string,
  rightOperand: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftInfixOperatorExpression {
  return {
    kind: SwiftNodeKind.InfixOperatorExpression,
    leadingComments,
    leftOperand,
    operator,
    rightOperand,
    trailingComments,
  };
}
