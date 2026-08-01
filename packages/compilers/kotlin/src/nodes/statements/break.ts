import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';

export interface KotlinBreakStatement extends KotlinNodeBase {
  kind: KotlinNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinBreakStatement {
  return { kind: KotlinNodeKind.BreakStatement, label, leadingComments, trailingComments };
}
