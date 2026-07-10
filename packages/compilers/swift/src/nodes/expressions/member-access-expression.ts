import type { SwiftNodeBase } from '../base';
import type { SwiftExpression } from '../expression';
import { SwiftNodeKind } from '../kinds';

export interface SwiftMemberAccessExpression extends SwiftNodeBase {
  base: SwiftExpression;
  declName: string;
  kind: SwiftNodeKind.MemberAccessExpression;
}

export function createMemberAccessExpression(
  base: SwiftExpression,
  declName: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMemberAccessExpression {
  return {
    base,
    declName,
    kind: SwiftNodeKind.MemberAccessExpression,
    leadingComments,
    trailingComments,
  };
}
