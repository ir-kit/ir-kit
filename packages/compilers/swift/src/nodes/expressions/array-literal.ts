import type { SwiftNodeBase } from "../base.js";
import type { SwiftExpression } from "../expression.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftArrayLiteral extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftExpression>;
  kind: SwiftNodeKind.ArrayLiteral;
}

export function createArrayLiteral(
  elements: ReadonlyArray<SwiftExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftArrayLiteral {
  return {
    elements,
    kind: SwiftNodeKind.ArrayLiteral,
    leadingComments,
    trailingComments,
  };
}
