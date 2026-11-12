import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import type { JavaPackageDeclaration } from "./package.js";
import { createPackageDeclaration } from "./package.js";

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
    packageDeclaration: packageName
      ? createPackageDeclaration(packageName)
      : undefined,
    statements,
    trailingComments,
  };
}
