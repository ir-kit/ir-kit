import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinStatement } from '../statement';

export interface KotlinSourceFile extends KotlinNodeBase {
  kind: KotlinNodeKind.SourceFile;
  statements: ReadonlyArray<KotlinStatement>;
}

export function createSourceFile(
  statements: ReadonlyArray<KotlinStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinSourceFile {
  return {
    kind: KotlinNodeKind.SourceFile,
    leadingComments,
    statements,
    trailingComments,
  };
}
