import type { SwiftExpression } from './expression';
import type { SwiftNodeKind } from './kinds';
import type { SwiftPattern } from './pattern';
import type { SwiftStatement } from './statement';
import type { SwiftSourceFile } from './structure/source-file';
import type { SwiftType } from './type';

export interface SwiftNodeBase {
  kind: SwiftNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type SwiftNode =
  | SwiftSourceFile
  | SwiftExpression
  | SwiftPattern
  | SwiftStatement
  | SwiftType;
