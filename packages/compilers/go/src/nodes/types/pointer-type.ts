import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

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
