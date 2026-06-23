import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoSliceExpression extends GoNodeBase {
  high?: GoExpression;
  kind: GoNodeKind.SliceExpression;
  low?: GoExpression;
  max?: GoExpression;
  object: GoExpression; // if present, print 3-index form
}

export function createSliceExpression(
  object: GoExpression,
  low?: GoExpression,
  high?: GoExpression,
  max?: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoSliceExpression {
  return {
    high,
    kind: GoNodeKind.SliceExpression,
    leadingComments,
    low,
    max,
    object,
    trailingComments,
  };
}
