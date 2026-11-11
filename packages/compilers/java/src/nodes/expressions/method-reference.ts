import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaMethodReferenceExpression extends JavaNodeBase {
  kind: JavaNodeKind.MethodReferenceExpression;
  qualifier: JavaExpression;
  reference: string;
}

export function createMethodReferenceExpression(
  qualifier: JavaExpression,
  reference: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaMethodReferenceExpression {
  return {
    kind: JavaNodeKind.MethodReferenceExpression,
    leadingComments,
    qualifier,
    reference,
    trailingComments,
  };
}
