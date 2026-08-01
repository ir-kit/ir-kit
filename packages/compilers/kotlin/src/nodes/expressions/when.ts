import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinWhenEntry } from '../shared';

export interface KotlinWhenExpression extends KotlinNodeBase {
  entries: ReadonlyArray<KotlinWhenEntry>;
  kind: KotlinNodeKind.WhenExpression;
  subject?: KotlinExpression;
}

export function createWhenExpression(
  entries: ReadonlyArray<KotlinWhenEntry>,
  subject?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinWhenExpression {
  return {
    entries,
    kind: KotlinNodeKind.WhenExpression,
    leadingComments,
    subject,
    trailingComments,
  };
}
