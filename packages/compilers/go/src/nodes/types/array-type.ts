import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export type GoArraySize = GoExpression | "...";

export interface GoArrayType extends GoNodeBase {
  elementType: GoType;
  kind: GoNodeKind.ArrayType;
  size?: GoArraySize;
}

export function createArrayType(
  elementType: GoType,
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
