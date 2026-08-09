import type { KotlinNodeBase } from '../base';
import type { KotlinDeclaration } from '../declaration';
import { KotlinNodeKind } from '../kinds';
import type { KotlinImportDirective } from './import-directive';
import type { KotlinPackageHeader } from './package-header';

export interface KotlinSourceFile extends KotlinNodeBase {
  declarations: ReadonlyArray<KotlinDeclaration>;
  imports?: ReadonlyArray<KotlinImportDirective>;
  kind: KotlinNodeKind.SourceFile;
  packageHeader?: KotlinPackageHeader;
}

export function createSourceFile(
  declarations: ReadonlyArray<KotlinDeclaration>,
  packageHeader?: KotlinPackageHeader,
  imports?: ReadonlyArray<KotlinImportDirective>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinSourceFile {
  return {
    declarations,
    imports,
    kind: KotlinNodeKind.SourceFile,
    leadingComments,
    packageHeader,
    trailingComments,
  };
}
