import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinWhenEntry } from '../shared';

export interface KotlinWhenStatement extends KotlinNodeBase {
  entries: ReadonlyArray<KotlinWhenEntry>;
  kind: KotlinNodeKind.WhenStatement;
  subject?: KotlinExpression;
}

export function createWhenStatement(
  entries: ReadonlyArray<KotlinWhenEntry>,
  subject?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinWhenStatement {
  return {
    entries,
    kind: KotlinNodeKind.WhenStatement,
    leadingComments,
    subject,
    trailingComments,
  };
}
