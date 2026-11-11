import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftType } from "../type.js";

export interface SwiftIsPattern extends SwiftNodeBase {
  kind: SwiftNodeKind.IsPattern;
  type: SwiftType;
}

export function createIsPattern(
  type: SwiftType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIsPattern {
  return {
    kind: SwiftNodeKind.IsPattern,
    leadingComments,
    trailingComments,
    type,
  };
}
