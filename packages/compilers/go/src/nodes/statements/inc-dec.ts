import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export type GoIncDecOperator = '++' | '--';

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
