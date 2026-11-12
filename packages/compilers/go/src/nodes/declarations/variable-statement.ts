import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoVariableDeclarationList } from "./variable-declaration-list.js";

export interface GoVariableStatement extends GoNodeBase {
  declarationList: GoVariableDeclarationList;
  kind: GoNodeKind.VariableStatement;
}

export function createVariableStatement(
  modifiers: undefined,
  declarationList: GoVariableDeclarationList,
): GoVariableStatement {
  return {
    declarationList,
    kind: GoNodeKind.VariableStatement,
  };
}
