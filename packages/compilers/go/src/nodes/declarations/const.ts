import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoFunctionDeclaration } from './function';

export interface GoConstDeclaration extends GoNodeBase {
  kind: GoNodeKind.ConstDeclaration;
  name: string;
  type?: GoExpression;
  value: GoExpression | GoFunctionDeclaration;
}

export function createConstDeclaration(
  name: string,
  value: GoExpression | GoFunctionDeclaration,
  type?: GoExpression,
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
