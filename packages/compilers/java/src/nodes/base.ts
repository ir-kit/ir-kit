import type { JavaExpression } from "./expression.js";
import type { JavaNodeKind } from "./kinds.js";
import type { JavaStatement } from "./statement.js";
import type { JavaBlock } from "./statements/block.js";
import type { JavaPackageDeclaration } from "./structure/package.js";
import type { JavaSourceFile } from "./structure/source-file.js";

export interface JavaNodeBase {
  kind: JavaNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type JavaNode =
  | JavaSourceFile
  | JavaPackageDeclaration
  | JavaExpression
  | JavaStatement
  | JavaBlock;
