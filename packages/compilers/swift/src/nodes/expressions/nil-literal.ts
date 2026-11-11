import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftNilLiteral extends SwiftNodeBase {
  kind: SwiftNodeKind.NilLiteral;
}

export function createNilLiteral(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftNilLiteral {
  return {
    kind: SwiftNodeKind.NilLiteral,
    leadingComments,
    trailingComments,
  };
}
