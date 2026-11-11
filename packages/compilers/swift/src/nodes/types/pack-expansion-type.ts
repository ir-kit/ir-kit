import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftPackExpansionType extends SwiftNodeBase {
  kind: SwiftNodeKind.PackExpansionType;
  repetitionPattern: SwiftType;
}

export function createPackExpansionType(
  repetitionPattern: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftPackExpansionType {
  return {
    kind: SwiftNodeKind.PackExpansionType,
    leadingComments,
    repetitionPattern,
    trailingComments,
  };
}
