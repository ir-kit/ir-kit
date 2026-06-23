import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export interface GoKeyValueExpression extends GoNodeBase {
  key: GoExpression;
  kind: GoNodeKind.KeyValueExpression;
  value: GoExpression;
}

export function createKeyValueExpression(
  key: GoExpression,
  value: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoKeyValueExpression {
  return {
    key,
    kind: GoNodeKind.KeyValueExpression,
    leadingComments,
    trailingComments,
    value,
  };
}
