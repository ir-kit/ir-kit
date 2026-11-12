import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftImplicitlyUnwrappedOptionalType extends SwiftNodeBase {
  kind: SwiftNodeKind.ImplicitlyUnwrappedOptionalType;
  wrappedType: SwiftType;
}

export function createImplicitlyUnwrappedOptionalType(
  wrappedType: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftImplicitlyUnwrappedOptionalType {
  return {
    kind: SwiftNodeKind.ImplicitlyUnwrappedOptionalType,
    leadingComments,
    trailingComments,
    wrappedType,
  };
}
