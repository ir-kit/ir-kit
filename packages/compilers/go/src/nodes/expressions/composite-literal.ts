import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoCompositeLiteral extends GoNodeBase {
  elements: ReadonlyArray<GoExpression>;
  kind: GoNodeKind.CompositeLiteral;
  type?: GoExpression;
}

export function createCompositeLiteral(
  elements: ReadonlyArray<GoExpression>,
  type?: GoExpression,
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
