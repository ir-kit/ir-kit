import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoFunctionParameter extends GoNodeBase {
  isVariadic?: boolean;
  kind: GoNodeKind.FunctionParameter;
  name: string;
  type: GoExpression;
}

export function createFunctionParameter(
  name: string,
  type: GoExpression,
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
