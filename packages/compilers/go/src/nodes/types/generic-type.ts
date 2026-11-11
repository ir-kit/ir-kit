import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

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
