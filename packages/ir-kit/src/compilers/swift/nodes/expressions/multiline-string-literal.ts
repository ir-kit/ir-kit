import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

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
