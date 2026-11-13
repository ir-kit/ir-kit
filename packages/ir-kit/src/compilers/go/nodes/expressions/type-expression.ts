import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

/** A type in expression position: a conversion callee or a type argument. */
export interface GoTypeExpression extends GoNodeBase {
  kind: GoNodeKind.TypeExpression;
  type: GoType;
}

export function createTypeExpression(
  type: GoType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoTypeExpression {
  return {
    kind: GoNodeKind.TypeExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
