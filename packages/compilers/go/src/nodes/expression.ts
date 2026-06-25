import type { GoIndexExpression } from './expressions';
import type { GoArrayType } from './expressions/array-type';
import type { GoBinaryExpression } from './expressions/binary';
import type { GoCallExpression } from './expressions/call';
import type { GoCompositeLiteral } from './expressions/composite-literal';
import type { GoIdentifier } from './expressions/identifier';
import type { GoInterfaceType } from './expressions/interface';
import type { GoKeyValueExpression } from './expressions/key-value';
import type { GoLiteral } from './expressions/literal';
import type { GoMapType } from './expressions/map-type';
import type { GoMemberExpression } from './expressions/member';
import type { GoPointerType } from './expressions/pointer-type';
import type { GoSliceExpression } from './expressions/slice';
import type { GoStructType } from './expressions/struct';
import type { GoUnaryExpression } from './expressions/unary';

export type GoExpression =
  | GoArrayType
  | GoBinaryExpression
  | GoCallExpression
  | GoCompositeLiteral
  | GoIdentifier
  | GoIndexExpression
  | GoInterfaceType
  | GoKeyValueExpression
  | GoLiteral
  | GoMapType
  | GoMemberExpression
  | GoPointerType
  | GoSliceExpression
  | GoStructType
  | GoUnaryExpression;
