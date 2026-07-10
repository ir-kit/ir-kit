import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

export type SwiftCatchClause = {
  body: ReadonlyArray<SwiftStatement>;
  pattern?: SwiftExpression;
};

export interface SwiftDoStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  catchClauses: ReadonlyArray<SwiftCatchClause>;
  kind: SwiftNodeKind.DoStatement;
}

export function createCatchClause(
  body: ReadonlyArray<SwiftStatement>,
  pattern?: SwiftExpression,
): SwiftCatchClause {
  return {
    body,
    pattern,
  };
}

export function createDoStatement(
  body: ReadonlyArray<SwiftStatement>,
  catchClauses: ReadonlyArray<SwiftCatchClause>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDoStatement {
  return {
    body,
    catchClauses,
    kind: SwiftNodeKind.DoStatement,
    leadingComments,
    trailingComments,
  };
}
