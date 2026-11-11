import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export type GoAugmentOperator =
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "&="
  | "|="
  | "^="
  | "<<="
  | ">>=";

export interface GoAugmentAssignment extends GoNodeBase {
  kind: GoNodeKind.AugmentAssignment;
  operator: GoAugmentOperator;
  target: GoExpression;
  value: GoExpression;
}

export function createAugmentAssignment(
  target: GoExpression,
  operator: GoAugmentOperator,
  value: GoExpression,
): GoAugmentAssignment {
  return {
    kind: GoNodeKind.AugmentAssignment,
    operator,
    target,
    value,
  };
}
