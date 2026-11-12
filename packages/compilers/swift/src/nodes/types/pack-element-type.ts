import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftPackElementType extends SwiftNodeBase {
  kind: SwiftNodeKind.PackElementType;
  pack: SwiftType;
}

export function createPackElementType(
  pack: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPackElementType {
  return {
    kind: SwiftNodeKind.PackElementType,
    leadingComments,
    pack,
    trailingComments,
  };
}
