import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export type LiteralValue = string | number | boolean | null;

export interface GoLiteral extends GoNodeBase {
  kind: GoNodeKind.Literal;
  value: LiteralValue;
}

export function createLiteral(
  value: LiteralValue,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoLiteral {
  return {
    kind: GoNodeKind.Literal,
    leadingComments,
    trailingComments,
    value,
  };
}
