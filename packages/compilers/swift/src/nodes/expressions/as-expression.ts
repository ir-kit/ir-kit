import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';
import type { SwiftType } from '../type';

export type SwiftAsKind = 'as' | 'as!' | 'as?';

export interface SwiftAsExpression extends SwiftNodeBase {
  asKind: SwiftAsKind;
  expression: SwiftExpression;
  kind: SwiftNodeKind.AsExpression;
  type: SwiftType;
}

export function createAsExpression(
  expression: SwiftExpression,
  type: SwiftType,
  asKind: SwiftAsKind,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftAsExpression {
  return {
    asKind,
    expression,
    kind: SwiftNodeKind.AsExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
