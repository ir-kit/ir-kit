import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

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
