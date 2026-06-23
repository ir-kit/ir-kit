import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoMapType extends GoNodeBase {
  keyType: GoExpression;
  kind: GoNodeKind.MapType;
  valueType: GoExpression;
}

export function createMapType(
  keyType: GoExpression,
  valueType: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoMapType {
  return {
    keyType,
    kind: GoNodeKind.MapType,
    leadingComments,
    trailingComments,
    valueType,
  };
}
