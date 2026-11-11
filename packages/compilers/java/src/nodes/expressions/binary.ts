import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';

export type JavaBinaryOperator =
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
  | '>>>';

export interface JavaBinaryExpression extends JavaNodeBase {
  kind: JavaNodeKind.BinaryExpression;
  left: JavaExpression;
  operator: JavaBinaryOperator;
  right: JavaExpression;
}

export function createBinaryExpression(
  left: JavaExpression,
  operator: JavaBinaryOperator,
  right: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaBinaryExpression {
  return {
    kind: JavaNodeKind.BinaryExpression,
    leadingComments,
    left,
    operator,
    right,
    trailingComments,
  };
}
