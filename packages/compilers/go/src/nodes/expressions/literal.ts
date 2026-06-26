import type { GoNodeBase } from '../base';
import { GoNodeKind } from '../kinds';

export type GoLiteralKind =
  | 'bool'
  | 'float'
  | 'imaginary'
  | 'int'
  | 'nil'
  | 'rawString'
  | 'rune'
  | 'string';

export interface GoLiteral extends GoNodeBase {
  kind: GoNodeKind.Literal;
  literalKind: GoLiteralKind;
  value: string;
}

function inferLiteralKind(value: string | number | boolean | null): GoLiteralKind {
  if (value === null) return 'nil';
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string') return 'string';
  return Number.isInteger(value) ? 'int' : 'float';
}

export function createLiteral(
  value: string | number | boolean | null,
  literalKind?: GoLiteralKind,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoLiteral {
  return {
    kind: GoNodeKind.Literal,
    leadingComments,
    literalKind: literalKind ?? inferLiteralKind(value),
    trailingComments,
    value: value === null ? '' : String(value),
  };
}
