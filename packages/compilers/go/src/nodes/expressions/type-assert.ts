import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export interface GoTypeAssertExpression extends GoNodeBase {
  kind: GoNodeKind.TypeAssertExpression;
  operand: GoExpression;
  type: GoType;
}

export function createTypeAssertExpression(
  operand: GoExpression,
  type: GoType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoTypeAssertExpression {
  return {
    kind: GoNodeKind.TypeAssertExpression,
    leadingComments,
    operand,
    trailingComments,
    type,
  };
}
