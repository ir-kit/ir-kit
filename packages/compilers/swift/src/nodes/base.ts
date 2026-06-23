import type { SwiftNodeKind } from './kinds';
import type { SwiftStatement } from './statement';
import type { SwiftSourceFile } from './structure/source-file';

export interface SwiftNodeBase {
  kind: SwiftNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type SwiftNode = SwiftSourceFile | SwiftStatement;
