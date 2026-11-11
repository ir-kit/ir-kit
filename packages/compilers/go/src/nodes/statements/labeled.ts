import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";

export interface GoLabeledStatement extends GoNodeBase {
  kind: GoNodeKind.LabeledStatement;
  label: string;
  statement: GoStatement;
}

export function createLabeledStatement(
  label: string,
  statement: GoStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoLabeledStatement {
  return {
    kind: GoNodeKind.LabeledStatement,
    label,
    leadingComments,
    statement,
    trailingComments,
  };
}
