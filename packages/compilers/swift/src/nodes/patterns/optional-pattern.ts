import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';
import type { SwiftPattern } from '../pattern';

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
