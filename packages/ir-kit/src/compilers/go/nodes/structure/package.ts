import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";

export interface GoPackageDeclaration extends GoNodeBase {
  kind: GoNodeKind.PackageDeclaration;
  name: string;
}

export function createPackageDeclaration(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoPackageDeclaration {
  return {
    kind: GoNodeKind.PackageDeclaration,
    leadingComments,
    name,
    trailingComments,
  };
}
