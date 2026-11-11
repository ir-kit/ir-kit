import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinBreakStatement extends KotlinNodeBase {
  kind: KotlinNodeKind.BreakStatement;
  label?: string;
}

export function createBreakStatement(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinBreakStatement {
  return {
    kind: KotlinNodeKind.BreakStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
