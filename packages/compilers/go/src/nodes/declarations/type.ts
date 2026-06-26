import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoTypeDeclaration extends GoNodeBase {
  isAlias?: boolean;
  kind: GoNodeKind.TypeDeclaration;
  name: string;
  type: GoType;
}

export function createTypeDeclaration(
  name: string,
  type: GoType,
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
  };
}
