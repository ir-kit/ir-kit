import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';

export interface KotlinContinueStatement extends KotlinNodeBase {
  kind: KotlinNodeKind.ContinueStatement;
  label?: string;
}

export function createContinueStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinContinueStatement {
  return { kind: KotlinNodeKind.ContinueStatement, label, leadingComments, trailingComments };
}
