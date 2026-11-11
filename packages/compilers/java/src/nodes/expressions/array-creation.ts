import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaArrayCreationExpression extends JavaNodeBase {
  dimensions: ReadonlyArray<JavaExpression | undefined>;
  initializer?: JavaExpression;
  kind: JavaNodeKind.ArrayCreationExpression;
  type: JavaExpression;
}

export function createArrayCreationExpression(
  type: JavaExpression,
  dimensions: ReadonlyArray<JavaExpression | undefined>,
  initializer?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaArrayCreationExpression {
  return {
    dimensions,
    initializer,
    kind: JavaNodeKind.ArrayCreationExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
