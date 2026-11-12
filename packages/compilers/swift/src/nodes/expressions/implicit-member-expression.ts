import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

/** `.name`, a member of the contextual type. */
export interface SwiftImplicitMemberExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.ImplicitMemberExpression;
  name: string;
}

export function createImplicitMemberExpression(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftImplicitMemberExpression {
  return {
    kind: SwiftNodeKind.ImplicitMemberExpression,
    leadingComments,
    name,
    trailingComments,
  };
}
