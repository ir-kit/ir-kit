import type { GoNodeBase } from "../base.js";
import { GoNodeKind } from "../kinds.js";

export interface GoEmptyStatement extends GoNodeBase {
  kind: GoNodeKind.EmptyStatement;
}

export function createEmptyStatement(): GoEmptyStatement {
  return { kind: GoNodeKind.EmptyStatement };
}
