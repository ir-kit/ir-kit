import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export interface JavaYieldStatement extends JavaNodeBase {
  expression: JavaExpression;
  kind: JavaNodeKind.YieldStatement;
}

export function createYieldStatement(
  expression: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaYieldStatement {
  return {
    expression,
    kind: JavaNodeKind.YieldStatement,
    leadingComments,
    trailingComments,
  };
}
