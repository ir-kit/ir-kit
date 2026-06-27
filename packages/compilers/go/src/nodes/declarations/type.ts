import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';
import type { GoTypeParameter } from './type-parameter';

export type GoTypeSpec = {
  isAlias?: boolean;
  name: string;
  type: GoType;
  typeParameters?: ReadonlyArray<GoTypeParameter>;
};

export interface GoTypeDeclaration extends GoNodeBase {
  kind: GoNodeKind.TypeDeclaration;
  specs: ReadonlyArray<GoTypeSpec>;
}

export function createTypeDeclaration(
  specs: ReadonlyArray<GoTypeSpec>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoTypeDeclaration {
  return {
    kind: GoNodeKind.TypeDeclaration,
    leadingComments,
    specs,
    trailingComments,
  };
}
