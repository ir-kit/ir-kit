import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

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
