import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoIdentifier } from "./identifier.js";

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
