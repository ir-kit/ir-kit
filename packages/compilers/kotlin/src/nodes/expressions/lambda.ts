import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinLambdaParameter } from "../shared.js";
import type { KotlinStatement } from "../statement.js";

export interface KotlinLambdaExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.LambdaExpression;
  parameters?: ReadonlyArray<KotlinLambdaParameter>;
  statements: ReadonlyArray<KotlinStatement>;
}

export function createLambdaExpression(
  statements: ReadonlyArray<KotlinStatement>,
  parameters?: ReadonlyArray<KotlinLambdaParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinLambdaExpression {
  return {
    kind: KotlinNodeKind.LambdaExpression,
    leadingComments,
    parameters,
    statements,
    trailingComments,
  };
}
