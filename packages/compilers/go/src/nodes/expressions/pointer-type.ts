import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoPointerType extends GoNodeBase {
  elementType: GoExpression;
  kind: GoNodeKind.PointerType;
}

export function createPointerType(
  elementType: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoPointerType {
  return {
    elementType,
    kind: GoNodeKind.PointerType,
    leadingComments,
    trailingComments,
  };
}
