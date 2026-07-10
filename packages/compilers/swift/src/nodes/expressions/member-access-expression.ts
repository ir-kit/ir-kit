import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftMemberAccessExpression extends SwiftNodeBase {
  base: SwiftExpression;
  kind: SwiftNodeKind.MemberAccessExpression;
  name: string;
}

export function createMemberAccessExpression(
  base: SwiftExpression,
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMemberAccessExpression {
  return {
    base,
    kind: SwiftNodeKind.MemberAccessExpression,
    leadingComments,
    name,
    trailingComments,
  };
}
