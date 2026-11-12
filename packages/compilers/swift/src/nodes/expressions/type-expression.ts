import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

/** A type in expression position, e.g. the callee of `[Int]()` or `Pet.self`. */
export interface SwiftTypeExpression extends SwiftNodeBase {
  kind: SwiftNodeKind.TypeExpression;
  type: SwiftType;
}

export function createTypeExpression(
  type: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTypeExpression {
  return {
    kind: SwiftNodeKind.TypeExpression,
    leadingComments,
    trailingComments,
    type,
  };
}
