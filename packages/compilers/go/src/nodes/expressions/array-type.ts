import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export type GoArraySize = GoExpression | '...';

export interface GoArrayType extends GoNodeBase {
  elementType: GoExpression;
  kind: GoNodeKind.ArrayType;
  size?: GoArraySize;
}

export function createArrayType(
  elementType: GoExpression,
  size?: GoArraySize,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoArrayType {
  return {
    elementType,
    kind: GoNodeKind.ArrayType,
    leadingComments,
    size,
    trailingComments,
  };
}
