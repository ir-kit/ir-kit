import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export type SwiftImportKindSpecifier =
  | "class"
  | "enum"
  | "func"
  | "let"
  | "protocol"
  | "struct"
  | "typealias"
  | "var";

export interface SwiftImportDeclaration extends SwiftNodeBase {
  importKindSpecifier?: SwiftImportKindSpecifier;
  kind: SwiftNodeKind.ImportDeclaration;
  path: string;
}

export function createImportDeclaration(
  path: string,
  importKindSpecifier?: SwiftImportKindSpecifier,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftImportDeclaration {
  return {
    importKindSpecifier,
    kind: SwiftNodeKind.ImportDeclaration,
    leadingComments,
    path,
    trailingComments,
  };
}
