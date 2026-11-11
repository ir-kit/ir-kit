import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export interface GoCompositeLiteral extends GoNodeBase {
  elements: ReadonlyArray<GoExpression>;
  kind: GoNodeKind.CompositeLiteral;
  type?: GoType;
}

export function createCompositeLiteral(
  elements: ReadonlyArray<GoExpression>,
  type?: GoType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoCompositeLiteral {
  return {
    elements,
    kind: GoNodeKind.CompositeLiteral,
    leadingComments,
    trailingComments,
    type,
  };
}
