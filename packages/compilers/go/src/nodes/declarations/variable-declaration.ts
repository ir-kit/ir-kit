import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoVariableDeclaration extends GoNodeBase {
  initializer?: GoExpression;
  kind: GoNodeKind.VariableDeclaration;
  name: string;
  type?: GoType;
}

export function createVariableDeclaration(
  name: string,
  type?: GoType,
  initializer?: GoExpression,
): GoVariableDeclaration {
  return {
    initializer,
    kind: GoNodeKind.VariableDeclaration,
    name,
    type,
  };
}
