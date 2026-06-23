import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';
import type { GoStatement } from '../statement';
import { createPackageDeclaration, type GoPackageDeclaration } from './package';

export interface GoSourceFile extends GoNodeBase {
  kind: GoNodeKind.SourceFile;
  packageDeclaration: GoPackageDeclaration;
  statements: ReadonlyArray<GoStatement>;
}

export function createSourceFile(
  packageDeclaration: string,
  statements: ReadonlyArray<GoStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoSourceFile {
  return {
    kind: GoNodeKind.SourceFile,
    leadingComments,
    packageDeclaration: createPackageDeclaration(packageDeclaration),
    statements,
    trailingComments,
  };
}
