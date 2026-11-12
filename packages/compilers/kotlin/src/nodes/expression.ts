import type { KotlinAsExpression } from "./expressions/as-expression.js";
import type { KotlinBinaryExpression } from "./expressions/binary.js";
import type { KotlinCallExpression } from "./expressions/call.js";
import type { KotlinCallableReference } from "./expressions/callable-reference.js";
import type { KotlinElvisExpression } from "./expressions/elvis.js";
import type { KotlinIdentifier } from "./expressions/identifier.js";
import type { KotlinIfExpression } from "./expressions/if.js";
import type { KotlinIndexingExpression } from "./expressions/indexing-expression.js";
import type { KotlinIsExpression } from "./expressions/is-expression.js";
import type { KotlinLambdaExpression } from "./expressions/lambda.js";
import type { KotlinLiteral } from "./expressions/literal.js";
import type { KotlinNavigationExpression } from "./expressions/navigation.js";
import type { KotlinParenthesizedExpression } from "./expressions/parenthesized.js";
import type { KotlinPostfixUnaryExpression } from "./expressions/postfix-unary.js";
import type { KotlinPrefixUnaryExpression } from "./expressions/prefix-unary.js";
import type { KotlinStringLiteral } from "./expressions/string-literal.js";
import type { KotlinSuperExpression } from "./expressions/super-expression.js";
import type { KotlinThisExpression } from "./expressions/this-expression.js";
import type { KotlinWhenExpression } from "./expressions/when.js";

export type KotlinExpression =
  | KotlinAsExpression
  | KotlinBinaryExpression
  | KotlinCallExpression
  | KotlinCallableReference
  | KotlinElvisExpression
  | KotlinIdentifier
  | KotlinIfExpression
  | KotlinIndexingExpression
  | KotlinIsExpression
  | KotlinLambdaExpression
  | KotlinLiteral
  | KotlinNavigationExpression
  | KotlinParenthesizedExpression
  | KotlinPostfixUnaryExpression
  | KotlinPrefixUnaryExpression
  | KotlinStringLiteral
  | KotlinSuperExpression
  | KotlinThisExpression
  | KotlinWhenExpression;
