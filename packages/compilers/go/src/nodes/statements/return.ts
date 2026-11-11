import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoReturnStatement extends GoNodeBase {
  expressions: ReadonlyArray<GoExpression>;
  kind: GoNodeKind.ReturnStatement;
}

export function createReturnStatement(
  expressions?: ReadonlyArray<GoExpression> | GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoReturnStatement {
  return {
    expressions: expressions ? (expressions instanceof Array ? expressions : [expressions]) : [],
    kind: GoNodeKind.ReturnStatement,
    leadingComments,
    trailingComments,
  };
}
