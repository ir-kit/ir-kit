import type { GoIndexExpression } from './expressions';
import type { GoBinaryExpression } from './expressions/binary';
import type { GoCallExpression } from './expressions/call';
import type { GoCompositeLiteral } from './expressions/composite-literal';
import type { GoFunctionLiteral } from './expressions/function-literal';
import type { GoIdentifier } from './expressions/identifier';
import type { GoKeyValueExpression } from './expressions/key-value';
import type { GoLiteral } from './expressions/literal';
import type { GoMemberExpression } from './expressions/member';
import type { GoSliceExpression } from './expressions/slice';
import type { GoTypeAssertExpression } from './expressions/type-assert';
import type { GoUnaryExpression } from './expressions/unary';

export type GoExpression =
  | GoBinaryExpression
  | GoCallExpression
  | GoCompositeLiteral
  | GoFunctionLiteral
  | GoIdentifier
  | GoIndexExpression
  | GoKeyValueExpression
  | GoLiteral
  | GoMemberExpression
  | GoSliceExpression
  | GoTypeAssertExpression
  | GoUnaryExpression;
