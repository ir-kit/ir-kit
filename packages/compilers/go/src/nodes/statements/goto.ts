import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";

export interface GoGotoStatement extends GoNodeBase {
  kind: GoNodeKind.GotoStatement;
  label: string;
}

export function createGotoStatement(
  label: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoGotoStatement {
  return {
    kind: GoNodeKind.GotoStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
