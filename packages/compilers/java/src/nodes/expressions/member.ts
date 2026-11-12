import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaMemberExpression extends JavaNodeBase {
  kind: JavaNodeKind.MemberExpression;
  member: JavaExpression;
  object: JavaExpression;
}

export function createMemberExpression(
  object: JavaExpression,
  member: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaMemberExpression {
  return {
    kind: JavaNodeKind.MemberExpression,
    leadingComments,
    member,
    object,
    trailingComments,
  };
}
