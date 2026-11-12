import type { KotlinNodeBase } from "../base.js";
import type { KotlinDeclaration } from "../declaration.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinImportDirective } from "./import-directive.js";
import type { KotlinPackageHeader } from "./package-header.js";

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
