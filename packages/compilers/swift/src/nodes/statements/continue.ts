import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftContinueStatement extends SwiftNodeBase {
  kind: SwiftNodeKind.ContinueStatement;
  label?: string;
}

export function createContinueStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftContinueStatement {
  return {
    kind: SwiftNodeKind.ContinueStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
