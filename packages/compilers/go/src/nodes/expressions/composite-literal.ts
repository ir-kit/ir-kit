import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoCompositeLiteral extends GoNodeBase {
  elements: ReadonlyArray<GoExpression>;
  kind: GoNodeKind.CompositeLiteral;
  type?: GoType;
}

export function createCompositeLiteral(
  elements: ReadonlyArray<GoExpression>,
  type?: GoType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoCompositeLiteral {
  return {
    elements,
    kind: GoNodeKind.CompositeLiteral,
    leadingComments,
    trailingComments,
    type,
  };
}
