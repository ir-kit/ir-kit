import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftAssignmentExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.AssignmentExpression;
  target: SwiftExpression;
  value: SwiftExpression;
}

export function createAssignmentExpression(
  target: SwiftExpression,
  value: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAssignmentExpression {
  return {
    kind: SwiftNodeKind.AssignmentExpression,
    leadingComments,
    target,
    trailingComments,
    value,
  };
}
