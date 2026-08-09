import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';
import type { SwiftStatement } from '../statement';

export interface SwiftForInStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  casePattern?: SwiftPattern;
  kind: SwiftNodeKind.ForInStatement;
  pattern: string;
  sequence: SwiftExpression;
}

export function createForInStatement(
  pattern: string,
  sequence: SwiftExpression,
  body: ReadonlyArray<SwiftStatement>,
  casePattern?: SwiftPattern,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftForInStatement {
  return {
    body,
    casePattern,
    kind: SwiftNodeKind.ForInStatement,
    leadingComments,
    pattern,
    sequence,
    trailingComments,
  };
}
