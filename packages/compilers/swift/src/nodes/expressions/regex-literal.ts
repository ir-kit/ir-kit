import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftRegexLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.RegexLiteral;
  pattern: string;
}

export function createRegexLiteral(
  pattern: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftRegexLiteral {
  return {
    kind: SwiftNodeKind.RegexLiteral,
    leadingComments,
    pattern,
    trailingComments,
  };
}
