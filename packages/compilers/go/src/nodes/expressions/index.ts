import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoIndexExpression extends GoNodeBase {
  index: GoExpression;
  kind: GoNodeKind.IndexExpression;
  object: GoExpression;
}

export function createIndexExpression(
  object: GoExpression,
  index: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoIndexExpression {
  return {
    index,
    kind: GoNodeKind.IndexExpression,
    leadingComments,
    object,
    trailingComments,
  };
}
