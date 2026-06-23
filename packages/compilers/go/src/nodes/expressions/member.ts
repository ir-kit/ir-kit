import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoIdentifier } from './identifier';

export interface GoMemberExpression extends GoNodeBase {
  kind: GoNodeKind.MemberExpression;
  member: GoIdentifier;
  object: GoExpression;
}

export function createMemberExpression(
  object: GoExpression,
  member: GoIdentifier,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoMemberExpression {
  return {
    kind: GoNodeKind.MemberExpression,
    leadingComments,
    member,
    object,
    trailingComments,
  };
}
