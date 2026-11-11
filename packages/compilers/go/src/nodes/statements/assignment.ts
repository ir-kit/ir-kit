import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoAssignment extends GoNodeBase {
  kind: GoNodeKind.Assignment;
  targets: ReadonlyArray<GoExpression>;
  values: ReadonlyArray<GoExpression>;
}

export function createAssignment(
  targets: ReadonlyArray<GoExpression>,
  values: ReadonlyArray<GoExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoAssignment {
  return {
    kind: GoNodeKind.Assignment,
    leadingComments,
    targets,
    trailingComments,
    values,
  };
}
