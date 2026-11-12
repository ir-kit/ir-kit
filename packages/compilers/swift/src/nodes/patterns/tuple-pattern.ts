import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftPattern } from "../pattern.js";

export interface SwiftTuplePattern extends SwiftNodeBase {
  elements: ReadonlyArray<SwiftPattern>;
  kind: SwiftNodeKind.TuplePattern;
}

export function createTuplePattern(
  elements: ReadonlyArray<SwiftPattern>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftTuplePattern {
  return {
    elements,
    kind: SwiftNodeKind.TuplePattern,
    leadingComments,
    trailingComments,
  };
}
