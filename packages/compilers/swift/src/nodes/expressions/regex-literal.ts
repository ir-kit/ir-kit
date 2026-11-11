import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftRegexLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.RegexLiteral;
  regex: string;
}

export function createRegexLiteral(
  regex: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftRegexLiteral {
  return {
    kind: SwiftNodeKind.RegexLiteral,
    leadingComments,
    regex,
    trailingComments,
  };
}
