import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoTypeAssertExpression extends GoNodeBase {
  kind: GoNodeKind.TypeAssertExpression;
  operand: GoExpression;
  type: GoExpression;
}

export function createTypeAssertExpression(
  operand: GoExpression,
  type: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoTypeAssertExpression {
  return {
    kind: GoNodeKind.TypeAssertExpression,
    leadingComments,
    operand,
    trailingComments,
    type,
  };
}
