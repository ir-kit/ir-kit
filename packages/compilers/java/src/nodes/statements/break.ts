import type { JavaNodeBase } from "../base.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaBreakStatement extends JavaNodeBase {
  kind: JavaNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
  label?: string,
): JavaBreakStatement {
  return {
    kind: JavaNodeKind.BreakStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
