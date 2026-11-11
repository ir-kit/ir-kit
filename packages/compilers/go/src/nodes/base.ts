import type { GoExpression } from "./expression.js";
import type { GoNodeKind } from "./kinds.js";
import type { GoStatement } from "./statement.js";
import type { GoBlock } from "./statements/block.js";
import type { GoPackageDeclaration } from "./structure/package.js";
import type { GoSourceFile } from "./structure/source-file.js";
import type { GoType } from "./type.js";

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
