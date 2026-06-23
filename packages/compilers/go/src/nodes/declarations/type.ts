import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoTypeDeclaration extends GoNodeBase {
  isAlias?: boolean;
  kind: GoNodeKind.TypeDeclaration;
  name: string;
  type: GoExpression;
}

export function createTypeDeclaration(
  name: string,
  type: GoExpression,
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
