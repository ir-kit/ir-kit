import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

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
