import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftPattern } from "../pattern.js";
import type { SwiftStatement } from "../statement.js";

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
