import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

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
