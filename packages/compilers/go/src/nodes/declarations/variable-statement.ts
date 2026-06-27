import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoVariableDeclarationList } from './variable-declaration-list';

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
