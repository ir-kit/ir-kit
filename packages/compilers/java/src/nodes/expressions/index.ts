import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaIndexExpression extends JavaNodeBase {
  index: JavaExpression;
  kind: JavaNodeKind.IndexExpression;
  object: JavaExpression;
}

export function createIndexExpression(
  object: JavaExpression,
  index: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaIndexExpression {
  return {
    index,
    kind: JavaNodeKind.IndexExpression,
    leadingComments,
    object,
    trailingComments,
  };
}
