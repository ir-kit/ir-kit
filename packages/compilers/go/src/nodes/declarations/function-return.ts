import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoFunctionReturn extends GoNodeBase {
  kind: GoNodeKind.FunctionReturn;
  name?: string;
  type: GoExpression;
}

export function createFunctionReturn(
  type: GoExpression,
  name?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionReturn {
  return {
    kind: GoNodeKind.FunctionReturn,
    leadingComments,
    name,
    trailingComments,
    type,
  };
}
