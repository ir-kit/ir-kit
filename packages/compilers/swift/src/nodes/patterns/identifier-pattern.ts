import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftIdentifierPattern extends SwiftNodeBase {
  identifier: string;
  kind: SwiftNodeKind.IdentifierPattern;
}

export function createIdentifierPattern(
  identifier: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftIdentifierPattern {
  return {
    identifier,
    kind: SwiftNodeKind.IdentifierPattern,
    leadingComments,
    trailingComments,
  };
}
