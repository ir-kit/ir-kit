import type { SwiftNodeBase } from '../base';
import { SwiftNodeKind } from '../kinds';

export interface SwiftMultilineStringLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.MultilineStringLiteral;
  lines: ReadonlyArray<string>;
}

export function createMultilineStringLiteral(
  lines: ReadonlyArray<string>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftMultilineStringLiteral {
  return {
    kind: SwiftNodeKind.MultilineStringLiteral,
    leadingComments,
    lines,
    trailingComments,
  };
}
