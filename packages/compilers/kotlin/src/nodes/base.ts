import type { KotlinNodeKind } from './kinds';
import type { KotlinStatement } from './statement';
import type { KotlinSourceFile } from './structure/source-file';

export interface KotlinNodeBase {
  kind: KotlinNodeKind;
  leadingComments?: ReadonlyArray<string>;
  trailingComments?: ReadonlyArray<string>;
}

export type KotlinNode = KotlinSourceFile | KotlinStatement;
