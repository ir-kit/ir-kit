import type { GoNodeBase } from '../base';
import type { GoCallExpression } from '../expressions/call';
import { GoNodeKind } from '../kinds';

export interface GoGoStatement extends GoNodeBase {
  expression: GoCallExpression;
  kind: GoNodeKind.GoStatement;
}

export function createGoStatement(expression: GoCallExpression): GoGoStatement {
  return {
    expression,
    kind: GoNodeKind.GoStatement,
  };
}
