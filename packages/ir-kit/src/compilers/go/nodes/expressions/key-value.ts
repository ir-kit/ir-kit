import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

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
