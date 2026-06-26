import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoFunctionParameter extends GoNodeBase {
  isVariadic?: boolean;
  kind: GoNodeKind.FunctionParameter;
  name: string;
  type: GoType;
}

export function createFunctionParameter(
  name: string,
  type: GoType,
  isVariadic?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionParameter {
  return {
    isVariadic,
    kind: GoNodeKind.FunctionParameter,
    leadingComments,
    name,
    trailingComments,
    type,
  };
}
