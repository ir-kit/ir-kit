import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoGenericType extends GoNodeBase {
  kind: GoNodeKind.GenericType;
  type: GoType;
  typeArguments: ReadonlyArray<GoType>;
}

export function createGenericType(
  type: GoType,
  typeArguments: ReadonlyArray<GoType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoGenericType {
  return {
    kind: GoNodeKind.GenericType,
    leadingComments,
    trailingComments,
    type,
    typeArguments,
  };
}
