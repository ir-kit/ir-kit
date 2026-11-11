import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaSuperExpression extends JavaNodeBase {
  kind: JavaNodeKind.SuperExpression;
}

export function createSuperExpression(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaSuperExpression {
  return {
    kind: JavaNodeKind.SuperExpression,
    leadingComments,
    trailingComments,
  };
}
