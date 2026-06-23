import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

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
