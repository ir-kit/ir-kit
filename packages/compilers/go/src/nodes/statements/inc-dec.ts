import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export type GoIncDecOperator = "++" | "--";

export interface GoIncDecStatement extends GoNodeBase {
  kind: GoNodeKind.IncDecStatement;
  operator: GoIncDecOperator;
  target: GoExpression;
}

export function createIncDecStatement(
  target: GoExpression,
  operator: GoIncDecOperator,
): GoIncDecStatement {
  return {
    kind: GoNodeKind.IncDecStatement,
    operator,
    target,
  };
}
