import type { SwiftNodeBase } from "../base.js";
import { SwiftNodeKind } from "../kinds.js";
import type { SwiftStatement } from "../statement.js";

export interface SwiftDeferStatement extends SwiftNodeBase {
  body: ReadonlyArray<SwiftStatement>;
  kind: SwiftNodeKind.DeferStatement;
}

export function createDeferStatement(
  body: ReadonlyArray<SwiftStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): SwiftDeferStatement {
  return {
    body,
    kind: SwiftNodeKind.DeferStatement,
    leadingComments,
    trailingComments,
  };
}
