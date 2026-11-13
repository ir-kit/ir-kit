import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaCallExpression extends JavaNodeBase {
  args: ReadonlyArray<JavaExpression>;
  callee: JavaExpression;
  kind: JavaNodeKind.CallExpression;
}

export function createCallExpression(
  callee: JavaExpression,
  args?: ReadonlyArray<JavaExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaCallExpression {
  return {
    args: args ?? [],
    callee,
    kind: JavaNodeKind.CallExpression,
    leadingComments,
    trailingComments,
  };
}
