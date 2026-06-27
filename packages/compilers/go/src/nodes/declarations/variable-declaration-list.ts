import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoNodeFlags } from '../node-flags';
import type { GoVariableDeclaration } from './variable-declaration';

export interface GoVariableDeclarationList extends GoNodeBase {
  declarations: ReadonlyArray<GoVariableDeclaration>;
  flags: GoNodeFlags;
  kind: GoNodeKind.VariableDeclarationList;
}

export function createVariableDeclarationList(
  declarations: ReadonlyArray<GoVariableDeclaration>,
  flags: GoNodeFlags,
): GoVariableDeclarationList {
  return {
    declarations,
    flags,
    kind: GoNodeKind.VariableDeclarationList,
  };
}
