import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoFunctionReturn extends GoNodeBase {
  kind: GoNodeKind.FunctionReturn;
  name?: string;
  type: GoType;
}

export function createFunctionReturn(
  type: GoType,
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
