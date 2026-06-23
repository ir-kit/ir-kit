import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoFunctionDeclaration } from './function';

export interface GoVarDeclaration extends GoNodeBase {
  kind: GoNodeKind.VarDeclaration;
  name: string;
  type?: GoExpression;
  value?: GoExpression | GoFunctionDeclaration;
}

export function createVarDeclaration(
  name: string,
  type?: GoExpression,
  value?: GoExpression | GoFunctionDeclaration,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoVarDeclaration {
  return {
    kind: GoNodeKind.VarDeclaration,
    leadingComments,
    name,
    trailingComments,
    type,
    value,
  };
}
