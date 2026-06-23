import type { JavaNodeBase } from '../base';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import type { JavaPackageDeclaration } from './package';
import { createPackageDeclaration } from './package';

export interface JavaSourceFile extends JavaNodeBase {
  kind: JavaNodeKind.SourceFile;
  packageDeclaration?: JavaPackageDeclaration;
  statements: ReadonlyArray<JavaStatement>;
}

export function createSourceFile(
  packageName: string | undefined,
  statements: ReadonlyArray<JavaStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaSourceFile {
  return {
    kind: JavaNodeKind.SourceFile,
    leadingComments,
    packageDeclaration: packageName ? createPackageDeclaration(packageName) : undefined,
    statements,
    trailingComments,
  };
}
