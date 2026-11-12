import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftArrayType extends SwiftNodeBase {
  element: SwiftType;
  kind: SwiftNodeKind.ArrayType;
}

export function createArrayType(
  element: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftArrayType {
  return {
    element,
    kind: SwiftNodeKind.ArrayType,
    leadingComments,
    trailingComments,
  };
}
