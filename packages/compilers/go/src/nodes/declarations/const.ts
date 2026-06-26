import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export type GoConstSpec = {
  name: string;
  type?: GoType;
  value?: GoExpression;
};

export interface GoConstDeclaration extends GoNodeBase {
  kind: GoNodeKind.ConstDeclaration;
  specs: ReadonlyArray<GoConstSpec>;
}

export function createConstDeclaration(
  specs: ReadonlyArray<GoConstSpec>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoConstDeclaration {
  return {
    kind: GoNodeKind.ConstDeclaration,
    leadingComments,
    specs,
    trailingComments,
  };
}
