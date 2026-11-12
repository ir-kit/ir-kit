import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export interface GoIndexExpression extends GoNodeBase {
  index: GoExpression;
  kind: GoNodeKind.IndexExpression;
  object: GoExpression;
}

export function createIndexExpression(
  object: GoExpression,
  index: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoIndexExpression {
  return {
    index,
    kind: GoNodeKind.IndexExpression,
    leadingComments,
    object,
    trailingComments,
  };
}
