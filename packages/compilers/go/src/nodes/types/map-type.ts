import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoMapType extends GoNodeBase {
  keyType: GoType;
  kind: GoNodeKind.MapType;
  valueType: GoType;
}

export function createMapType(
  keyType: GoType,
  valueType: GoType,
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
