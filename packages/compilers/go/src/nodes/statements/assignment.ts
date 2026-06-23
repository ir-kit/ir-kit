import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoAssignment extends GoNodeBase {
  kind: GoNodeKind.Assignment;
  target: GoExpression;
  value: GoExpression;
}

export function createAssignment(
  target: GoExpression,
  value: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoAssignment {
  return {
    kind: GoNodeKind.Assignment,
    leadingComments,
    target,
    trailingComments,
    value,
  };
}
