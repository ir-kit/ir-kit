import type { JavaAnnotation } from "./expressions/annotation.js";
import type { JavaArrayCreationExpression } from "./expressions/array-creation.js";
import type { JavaArrayInitializer } from "./expressions/array-initializer.js";
import type { JavaBinaryExpression } from "./expressions/binary.js";
import type { JavaCallExpression } from "./expressions/call.js";
import type { JavaCastExpression } from "./expressions/cast.js";
import type { JavaIdentifier } from "./expressions/identifier.js";
import type { JavaIndexExpression } from "./expressions/index.js";
import type { JavaInstanceOfExpression } from "./expressions/instanceof.js";
import type { JavaLambdaExpression } from "./expressions/lambda.js";
import type { JavaLiteral } from "./expressions/literal.js";
import type { JavaMemberExpression } from "./expressions/member.js";
import type { JavaMethodReferenceExpression } from "./expressions/method-reference.js";
import type { JavaNewExpression } from "./expressions/new.js";
import type { JavaSuperExpression } from "./expressions/super.js";
import type { JavaSwitchExpression } from "./expressions/switch.js";
import type { JavaTernaryExpression } from "./expressions/ternary.js";
import type { JavaThisExpression } from "./expressions/this.js";
import type {
  JavaArrayType,
  JavaParameterizedType,
  JavaTypeParameter,
  JavaWildcardTypeArgument,
} from "./expressions/type.js";
import type { JavaUnaryExpression } from "./expressions/unary.js";

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
