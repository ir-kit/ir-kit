import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export type SwiftImportKind =
  | 'class'
  | 'enum'
  | 'func'
  | 'let'
  | 'protocol'
  | 'struct'
  | 'typealias'
  | 'var';

export interface SwiftImportDeclaration extends SwiftNodeBase {
  importKind?: SwiftImportKind;
  kind: SwiftNodeKind.ImportDeclaration;
  path: string;
}

export function createImportDeclaration(
  path: string,
  importKind?: SwiftImportKind,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftImportDeclaration {
  return {
    importKind,
    kind: SwiftNodeKind.ImportDeclaration,
    leadingComments,
    path,
    trailingComments,
  };
}
