import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';
import type { GoTypeParameter } from './type-parameter';

export interface GoTypeDeclaration extends GoNodeBase {
  isAlias?: boolean;
  kind: GoNodeKind.TypeDeclaration;
  name: string;
  type: GoType;
  typeParameters?: ReadonlyArray<GoTypeParameter>;
}

export function createTypeDeclaration(
  name: string,
  type: GoType,
  typeParameters?: ReadonlyArray<GoTypeParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
  isAlias?: boolean,
): GoTypeDeclaration {
  return {
    isAlias,
    kind: GoNodeKind.TypeDeclaration,
    leadingComments,
    name,
    trailingComments,
    type,
    typeParameters,
  };
}
