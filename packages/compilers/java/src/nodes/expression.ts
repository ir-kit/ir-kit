import type { JavaAnnotation } from './expressions/annotation';
import type { JavaArrayCreationExpression } from './expressions/array-creation';
import type { JavaArrayInitializer } from './expressions/array-initializer';
import type { JavaBinaryExpression } from './expressions/binary';
import type { JavaCallExpression } from './expressions/call';
import type { JavaCastExpression } from './expressions/cast';
import type { JavaIdentifier } from './expressions/identifier';
import type { JavaIndexExpression } from './expressions/index';
import type { JavaInstanceOfExpression } from './expressions/instanceof';
import type { JavaLambdaExpression } from './expressions/lambda';
import type { JavaLiteral } from './expressions/literal';
import type { JavaMemberExpression } from './expressions/member';
import type { JavaMethodReferenceExpression } from './expressions/method-reference';
import type { JavaNewExpression } from './expressions/new';
import type { JavaSuperExpression } from './expressions/super';
import type { JavaSwitchExpression } from './expressions/switch';
import type { JavaTernaryExpression } from './expressions/ternary';
import type { JavaThisExpression } from './expressions/this';
import type {
  JavaArrayType,
  JavaParameterizedType,
  JavaTypeParameter,
  JavaWildcardTypeArgument,
} from './expressions/type';
import type { JavaUnaryExpression } from './expressions/unary';

export type JavaExpression =
  | JavaCallExpression
  | JavaBinaryExpression
  | JavaIdentifier
  | JavaLiteral
  | JavaMemberExpression
  | JavaThisExpression
  | JavaSuperExpression
  | JavaIndexExpression
  | JavaNewExpression
  | JavaLambdaExpression
  | JavaMethodReferenceExpression
  | JavaSwitchExpression
  | JavaTernaryExpression
  | JavaCastExpression
  | JavaInstanceOfExpression
  | JavaArrayCreationExpression
  | JavaArrayInitializer
  | JavaArrayType
  | JavaParameterizedType
  | JavaAnnotation
  | JavaWildcardTypeArgument
  | JavaTypeParameter
  | JavaUnaryExpression;
