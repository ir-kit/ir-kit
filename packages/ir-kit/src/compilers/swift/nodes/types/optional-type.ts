import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftOptionalType extends SwiftNodeBase {
  kind: SwiftNodeKind.OptionalType;
  wrappedType: SwiftType;
}

export function createOptionalType(
  wrappedType: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftOptionalType {
  return {
    kind: SwiftNodeKind.OptionalType,
    leadingComments,
    trailingComments,
    wrappedType,
  };
}
