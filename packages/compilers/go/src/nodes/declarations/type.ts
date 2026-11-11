import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoTypeSpec } from './type-spec';

export interface GoTypeDeclaration extends GoNodeBase {
  kind: GoNodeKind.TypeDeclaration;
  specs: ReadonlyArray<GoTypeSpec>;
}

export function createTypeDeclaration(specs: ReadonlyArray<GoTypeSpec>): GoTypeDeclaration {
  return {
    kind: GoNodeKind.TypeDeclaration,
    specs,
  };
}
