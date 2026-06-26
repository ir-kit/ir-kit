import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoVarDeclaration extends GoNodeBase {
  kind: GoNodeKind.VarDeclaration;
  name: string;
  type?: GoType;
  value?: GoExpression;
}

export function createVarDeclaration(
  name: string,
  type?: GoType,
  value?: GoExpression,
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
