import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';

export type GoBinaryOperator =
  // Arithmetic
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  // Comparison
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  // Logical
  | '&&'
  | '||'
  // Bitwise
  | '&'
  | '|'
  | '^'
  | '<<'
  | '>>'
  | '&^';

export interface GoBinaryExpression extends GoNodeBase {
  kind: GoNodeKind.BinaryExpression;
  left: GoExpression;
  operator: GoBinaryOperator;
  right: GoExpression;
}

export function createBinaryExpression(
  left: GoExpression,
  operator: GoBinaryOperator,
  right: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoBinaryExpression {
  return {
    kind: GoNodeKind.BinaryExpression,
    leadingComments,
    left,
    operator,
    right,
    trailingComments,
  };
}
