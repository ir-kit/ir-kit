import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';

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
