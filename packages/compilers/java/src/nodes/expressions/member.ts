import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

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
