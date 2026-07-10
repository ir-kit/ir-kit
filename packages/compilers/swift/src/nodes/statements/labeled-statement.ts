import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftStatement } from '../statement';

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
