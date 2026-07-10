import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';
import type { SwiftStatement } from '../statement';

export type SwiftSwitchCase = {
  caseItems?: ReadonlyArray<SwiftPattern>;
  statements: ReadonlyArray<SwiftStatement>;
};

export interface SwiftSwitchStatement extends SwiftNodeBase {
  cases: ReadonlyArray<SwiftSwitchCase>;
  kind: SwiftNodeKind.SwitchStatement;
  subject: SwiftExpression;
}

export function createSwitchCase(
  statements: ReadonlyArray<SwiftStatement>,
  caseItems?: ReadonlyArray<SwiftPattern>,
): SwiftSwitchCase {
  return {
    caseItems,
    statements,
  };
}

export function createSwitchStatement(
  subject: SwiftExpression,
  cases: ReadonlyArray<SwiftSwitchCase>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSwitchStatement {
  return {
    cases,
    kind: SwiftNodeKind.SwitchStatement,
    leadingComments,
    subject,
    trailingComments,
  };
}
