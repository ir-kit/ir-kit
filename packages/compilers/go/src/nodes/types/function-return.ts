import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

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
