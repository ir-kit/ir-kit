import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";

export interface SwiftBreakStatement extends SwiftNodeBase {
  kind: SwiftNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftBreakStatement {
  return {
    kind: SwiftNodeKind.BreakStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
