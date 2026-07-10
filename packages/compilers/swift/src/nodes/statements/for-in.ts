import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';
import type { SwiftStatement } from '../statement';

export interface SwiftForInStatement extends SwiftNodeBase {
  binding: string;
  body: ReadonlyArray<SwiftStatement>;
  casePattern?: SwiftPattern;
  kind: SwiftNodeKind.ForInStatement;
  sequence: SwiftExpression;
}

export function createForInStatement(
  binding: string,
  sequence: SwiftExpression,
  body: ReadonlyArray<SwiftStatement>,
  casePattern?: SwiftPattern,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftForInStatement {
  return {
    binding,
    body,
    casePattern,
    kind: SwiftNodeKind.ForInStatement,
    leadingComments,
    sequence,
    trailingComments,
  };
}
