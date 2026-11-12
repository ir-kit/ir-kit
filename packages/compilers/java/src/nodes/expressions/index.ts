import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaIndexExpression extends JavaNodeBase {
  index: JavaExpression;
  kind: JavaNodeKind.IndexExpression;
  object: JavaExpression;
}

export function createIndexExpression(
  object: JavaExpression,
  index: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaIndexExpression {
  return {
    index,
    kind: JavaNodeKind.IndexExpression,
    leadingComments,
    object,
    trailingComments,
  };
}
