import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export type SwiftRangeOperator = '...' | '..<';

export interface SwiftRangeExpression extends SwiftNodeBase {
  end?: SwiftExpression;
  kind: SwiftNodeKind.RangeExpression;
  operator: SwiftRangeOperator;
  start?: SwiftExpression;
}

export function createRangeExpression(
  operator: SwiftRangeOperator,
  start?: SwiftExpression,
  end?: SwiftExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftRangeExpression {
  return {
    end,
    kind: SwiftNodeKind.RangeExpression,
    leadingComments,
    operator,
    start,
    trailingComments,
  };
}
