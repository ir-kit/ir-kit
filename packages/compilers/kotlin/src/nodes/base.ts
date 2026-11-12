import type { KotlinDeclaration } from "./declaration.js";
import type { KotlinExpression } from "./expression.js";
import type { KotlinNodeKind } from "./kinds.js";
import type { KotlinStatement } from "./statement.js";
import type { KotlinImportDirective } from "./structure/import-directive.js";
import type { KotlinPackageHeader } from "./structure/package-header.js";
import type { KotlinSourceFile } from "./structure/source-file.js";
import type { KotlinType } from "./type.js";

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
