import type { KotlinDeclaration } from './declaration';
import type { KotlinExpression } from './expression';
import type { KotlinNodeKind } from './kinds';
import type { KotlinStatement } from './statement';
import type { KotlinImportDirective } from './structure/import-directive';
import type { KotlinPackageHeader } from './structure/package-header';
import type { KotlinSourceFile } from './structure/source-file';
import type { KotlinType } from './type';

export interface KotlinNodeBase {
  kind: KotlinNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type KotlinNode =
  | KotlinDeclaration
  | KotlinExpression
  | KotlinImportDirective
  | KotlinPackageHeader
  | KotlinSourceFile
  | KotlinStatement
  | KotlinType;
