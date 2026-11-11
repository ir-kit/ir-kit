import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinValueArgument } from '../shared';
import type { KotlinType } from '../type';
import type { KotlinLambdaExpression } from './lambda';

export interface KotlinCallExpression extends KotlinNodeBase {
  callee: KotlinExpression;
  kind: KotlinNodeKind.CallExpression;
  trailingLambda?: KotlinLambdaExpression;
  typeArguments?: ReadonlyArray<KotlinType>;
  valueArguments?: ReadonlyArray<KotlinValueArgument>;
}

export function createCallExpression(
  callee: KotlinExpression,
  valueArguments?: ReadonlyArray<KotlinValueArgument>,
  typeArguments?: ReadonlyArray<KotlinType>,
  trailingLambda?: KotlinLambdaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinCallExpression {
  return {
    callee,
    kind: KotlinNodeKind.CallExpression,
    leadingComments,
    trailingComments,
    trailingLambda,
    typeArguments,
    valueArguments,
  };
}
