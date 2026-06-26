import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoPointerType extends GoNodeBase {
  elementType: GoType;
  kind: GoNodeKind.PointerType;
}

export function createPointerType(
  elementType: GoType,
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
