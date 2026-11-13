import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoNodeFlags } from "../node-flags.js";
import type { GoVariableDeclaration } from "./variable-declaration.js";

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
