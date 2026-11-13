import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaInstanceOfExpression extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.InstanceOfExpression;
  type: JavaExpression;
}

export function createInstanceOfExpression(
  expression: JavaExpression,
  type: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaInstanceOfExpression {
  return {
    expression,
    kind: JavaNodeKind.InstanceOfExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
