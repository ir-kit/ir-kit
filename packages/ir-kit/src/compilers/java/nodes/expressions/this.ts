import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaThisExpression extends JavaNodeBase {
  kind: JavaNodeKind.ThisExpression;
}

export function createThisExpression(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaThisExpression {
  return {
    kind: JavaNodeKind.ThisExpression,
    leadingComments,
    trailingComments,
  };
}
