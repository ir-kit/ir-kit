import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftAsExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.AsExpression;
  questionOrExclamationMark?: '!' | '?';
  type: SwiftType;
}

export function createAsExpression(
  expression: SwiftExpression,
  type: SwiftType,
  questionOrExclamationMark?: '!' | '?',
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAsExpression {
  return {
    expression,
    kind: SwiftNodeKind.AsExpression,
    leadingComments,
    questionOrExclamationMark,
    trailingComments,
    type,
  };
}
