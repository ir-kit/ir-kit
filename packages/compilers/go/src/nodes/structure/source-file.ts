import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import {
  createPackageDeclaration,
  type GoPackageDeclaration,
} from "./package.js";

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
