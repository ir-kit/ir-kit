import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export type SwiftTryKind = 'try' | 'try!' | 'try?';

export interface SwiftTryExpression extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.TryExpression;
  tryKind: SwiftTryKind;
}

export function createTryExpression(
  expression: SwiftExpression,
  tryKind: SwiftTryKind,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTryExpression {
  return {
    expression,
    kind: SwiftNodeKind.TryExpression,
    leadingComments,
    trailingComments,
    tryKind,
  };
}
