import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export interface GoFunctionParameter extends GoNodeBase {
  isVariadic?: boolean;
  kind: GoNodeKind.FunctionParameter;
  names: ReadonlyArray<string>;
  type: GoType;
}

export function createFunctionParameter(
  names: ReadonlyArray<string>,
  type: GoType,
  isVariadic?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionParameter {
  return {
    isVariadic,
    kind: GoNodeKind.FunctionParameter,
    leadingComments,
    names,
    trailingComments,
    type,
  };
}
