import type { KotlinAsExpression } from './expressions/as-expression';
import type { KotlinBinaryExpression } from './expressions/binary';
import type { KotlinCallExpression } from './expressions/call';
import type { KotlinCallableReference } from './expressions/callable-reference';
import type { KotlinElvisExpression } from './expressions/elvis';
import type { KotlinIdentifier } from './expressions/identifier';
import type { KotlinIfExpression } from './expressions/if';
import type { KotlinIndexingExpression } from './expressions/indexing-expression';
import type { KotlinIsExpression } from './expressions/is-expression';
import type { KotlinLambdaExpression } from './expressions/lambda';
import type { KotlinLiteral } from './expressions/literal';
import type { KotlinNavigationExpression } from './expressions/navigation';
import type { KotlinParenthesizedExpression } from './expressions/parenthesized';
import type { KotlinPostfixUnaryExpression } from './expressions/postfix-unary';
import type { KotlinPrefixUnaryExpression } from './expressions/prefix-unary';
import type { KotlinStringLiteral } from './expressions/string-literal';
import type { KotlinSuperExpression } from './expressions/super-expression';
import type { KotlinThisExpression } from './expressions/this-expression';
import type { KotlinWhenExpression } from './expressions/when';

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
