import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftSuperExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.SuperExpression;
}

export function createSuperExpression(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSuperExpression {
  return {
    kind: SwiftNodeKind.SuperExpression,
    leadingComments,
    trailingComments,
  };
}
