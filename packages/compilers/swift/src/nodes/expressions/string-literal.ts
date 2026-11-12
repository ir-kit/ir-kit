import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftStringLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.StringLiteral;
  literal: string;
}

export function createStringLiteral(
  literal: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftStringLiteral {
  return {
    kind: SwiftNodeKind.StringLiteral,
    leadingComments,
    literal,
    trailingComments,
  };
}
