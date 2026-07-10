import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftTryExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.TryExpression;
  questionOrExclamationMark?: '!' | '?';
}

export function createTryExpression(
  expression: SwiftExpression,
  questionOrExclamationMark?: '!' | '?',
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTryExpression {
  return {
    expression,
    kind: SwiftNodeKind.TryExpression,
    leadingComments,
    questionOrExclamationMark,
    trailingComments,
  };
}
