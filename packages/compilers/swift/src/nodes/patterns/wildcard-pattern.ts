import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

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
