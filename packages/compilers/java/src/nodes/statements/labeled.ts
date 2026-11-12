import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";

export interface JavaLabeledStatement extends JavaNodeBase {
  kind: JavaNodeKind.LabeledStatement;
  label: string;
  statement: JavaStatement;
}

export function createLabeledStatement(
  label: string,
  statement: JavaStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaLabeledStatement {
  return {
    kind: JavaNodeKind.LabeledStatement,
    label,
    leadingComments,
    statement,
    trailingComments,
  };
}
