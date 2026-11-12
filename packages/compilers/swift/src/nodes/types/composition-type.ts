import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftCompositionType extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftType>;
  kind: SwiftNodeKind.CompositionType;
}

export function createCompositionType(
  elements: ReadonlyArray<SwiftType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftCompositionType {
  return {
    elements,
    kind: SwiftNodeKind.CompositionType,
    leadingComments,
    trailingComments,
  };
}
