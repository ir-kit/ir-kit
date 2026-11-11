import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

export interface SwiftLabeledStatement extends SwiftNodeBase {
  kind: SwiftNodeKind.LabeledStatement;
  label: string;
  statement: SwiftStatement;
}

export function createLabeledStatement(
  label: string,
  statement: SwiftStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftLabeledStatement {
  return {
    kind: SwiftNodeKind.LabeledStatement,
    label,
    leadingComments,
    statement,
    trailingComments,
  };
}
