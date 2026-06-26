import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';
import type { GoFunctionDeclaration } from './function';

export interface GoConstDeclaration extends GoNodeBase {
  kind: GoNodeKind.ConstDeclaration;
  name: string;
  type?: GoType;
  value: GoExpression | GoFunctionDeclaration;
}

export function createConstDeclaration(
  name: string,
  value: GoExpression | GoFunctionDeclaration,
  type?: GoType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoConstDeclaration {
  return {
    kind: GoNodeKind.ConstDeclaration,
    leadingComments,
    name,
    trailingComments,
    type,
    value,
  };
}
