import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinLambdaParameter } from '../shared';
import type { KotlinStatement } from '../statement';

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
