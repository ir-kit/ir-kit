import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoTypeSpec } from "./type-spec.js";

export interface GoTypeDeclaration extends GoNodeBase {
  kind: GoNodeKind.TypeDeclaration;
  specs: ReadonlyArray<GoTypeSpec>;
}

export function createTypeDeclaration(
  specs: ReadonlyArray<GoTypeSpec>,
): GoTypeDeclaration {
  return {
    kind: GoNodeKind.TypeDeclaration,
    specs,
  };
}
