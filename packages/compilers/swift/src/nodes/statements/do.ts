import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

export type SwiftCatchClause = {
  body: ReadonlyArray<SwiftStatement>;
  catchItems?: SwiftExpression;
};

export interface SwiftDoStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  catchClauses: ReadonlyArray<SwiftCatchClause>;
  kind: SwiftNodeKind.DoStatement;
}

export function createCatchClause(
  body: ReadonlyArray<SwiftStatement>,
  catchItems?: SwiftExpression,
): SwiftCatchClause {
  return {
    body,
    catchItems,
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
