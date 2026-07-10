import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftIdentifierPattern extends SwiftNodeBase {
  kind: SwiftNodeKind.IdentifierPattern;
  name: string;
}

export function createIdentifierPattern(
  name: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIdentifierPattern {
  return {
    kind: SwiftNodeKind.IdentifierPattern,
    leadingComments,
    name,
    trailingComments,
  };
}
