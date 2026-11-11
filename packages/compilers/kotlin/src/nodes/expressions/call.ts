import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinValueArgument } from "../shared.js";
import type { KotlinType } from "../type.js";
import type { KotlinLambdaExpression } from "./lambda.js";

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
