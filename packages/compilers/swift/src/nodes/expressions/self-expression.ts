import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftSelfExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.SelfExpression;
}

export function createSelfExpression(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftSelfExpression {
  return {
    kind: SwiftNodeKind.SelfExpression,
    leadingComments,
    trailingComments,
  };
}
