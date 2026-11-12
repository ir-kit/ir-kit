import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftWildcardPattern extends SwiftNodeBase {
  kind: SwiftNodeKind.WildcardPattern;
}

export function createWildcardPattern(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftWildcardPattern {
  return {
    kind: SwiftNodeKind.WildcardPattern,
    leadingComments,
    trailingComments,
  };
}
