import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export type GoVarSpec = {
  name: string;
  type?: GoType;
  value?: GoExpression;
};

export interface GoVarDeclaration extends GoNodeBase {
  kind: GoNodeKind.VarDeclaration;
  specs: ReadonlyArray<GoVarSpec>;
}

export function createVarDeclaration(
  specs: ReadonlyArray<GoVarSpec>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoVarDeclaration {
  return {
    kind: GoNodeKind.VarDeclaration,
    leadingComments,
    specs,
    trailingComments,
  };
}
