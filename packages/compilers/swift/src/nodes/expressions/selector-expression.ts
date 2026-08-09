import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftSelectorExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.SelectorExpression;
  target: SwiftExpression;
}

export function createSelectorExpression(
  target: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSelectorExpression {
  return {
    kind: SwiftNodeKind.SelectorExpression,
    leadingComments,
    target,
    trailingComments,
  };
}
