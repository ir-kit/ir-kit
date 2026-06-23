import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';

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
