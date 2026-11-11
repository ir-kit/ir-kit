import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';

export interface KotlinElvisExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.ElvisExpression;
  left: KotlinExpression;
  right: KotlinExpression;
}

export function createElvisExpression(
  left: KotlinExpression,
  right: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinElvisExpression {
  return {
    kind: KotlinNodeKind.ElvisExpression,
    leadingComments,
    left,
    right,
    trailingComments,
  };
}
