import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export interface SwiftIsExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.IsExpression;
  type: SwiftType;
}

export function createIsExpression(
  expression: SwiftExpression,
  type: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIsExpression {
  return {
    expression,
    kind: SwiftNodeKind.IsExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
