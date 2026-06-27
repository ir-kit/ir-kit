import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';

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
