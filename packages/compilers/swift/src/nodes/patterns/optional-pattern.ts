import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftPattern } from "../pattern.js";

export interface SwiftOptionalPattern extends SwiftNodeBase {
  kind: SwiftNodeKind.OptionalPattern;
  subPattern: SwiftPattern;
}

export function createOptionalPattern(
  subPattern: SwiftPattern,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftOptionalPattern {
  return {
    kind: SwiftNodeKind.OptionalPattern,
    leadingComments,
    subPattern,
    trailingComments,
  };
}
