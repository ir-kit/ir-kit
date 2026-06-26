import type { GoExpression } from './expression';
import type { GoNodeKind } from './kinds';
import type { GoStatement } from './statement';
import type { GoBlock } from './statements/block';
import type { GoPackageDeclaration } from './structure/package';
import type { GoSourceFile } from './structure/source-file';
import type { GoType } from './type';

export interface GoNodeBase {
  kind: GoNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type GoNode =
  | GoBlock
  | GoExpression
  | GoPackageDeclaration
  | GoSourceFile
  | GoStatement
  | GoType;
