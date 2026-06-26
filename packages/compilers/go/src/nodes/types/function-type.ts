import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoFunctionReturn } from './function-return';

export interface GoFunctionType extends GoNodeBase {
  kind: GoNodeKind.FunctionType;
  parameters: ReadonlyArray<GoExpression>;
  returnType: ReadonlyArray<GoFunctionReturn>;
}

export function createFunctionType(
  parameters: ReadonlyArray<GoExpression> | undefined,
  returnType: ReadonlyArray<GoFunctionReturn> | undefined,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFunctionType {
  return {
    kind: GoNodeKind.FunctionType,
    leadingComments,
    parameters: parameters ?? [],
    returnType: returnType ?? [],
    trailingComments,
  };
}
