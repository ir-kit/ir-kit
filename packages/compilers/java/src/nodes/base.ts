import type { JavaExpression } from './expression';
import type { JavaNodeKind } from './kinds';
import type { JavaStatement } from './statement';
import type { JavaBlock } from './statements/block';
import type { JavaPackageDeclaration } from './structure/package';
import type { JavaSourceFile } from './structure/source-file';

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
