import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';

export interface JavaPackageDeclaration extends JavaNodeBase {
  kind: JavaNodeKind.PackageDeclaration;
  name: string;
}

export function createPackageDeclaration(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaPackageDeclaration {
  return {
    kind: JavaNodeKind.PackageDeclaration,
    leadingComments,
    name,
    trailingComments,
  };
}
