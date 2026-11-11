import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftExpressionPattern extends SwiftNodeBase {
  expression: SwiftExpression;
  kind: SwiftNodeKind.ExpressionPattern;
}

export function createExpressionPattern(
  expression: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftExpressionPattern {
  return {
    expression,
    kind: SwiftNodeKind.ExpressionPattern,
    leadingComments,
    trailingComments,
  };
}
