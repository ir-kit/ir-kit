import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export interface GoEmptyStatement extends GoNodeBase {
  kind: GoNodeKind.EmptyStatement;
}

export function createEmptyStatement(): GoEmptyStatement {
  return { kind: GoNodeKind.EmptyStatement };
}
