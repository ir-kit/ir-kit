import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from '../statements/block';

export interface JavaLambdaParameter {
  name: string;
  type?: JavaExpression;
}

export interface JavaLambdaExpression extends JavaNodeBase {
  body: JavaBlock | JavaExpression;
  kind: JavaNodeKind.LambdaExpression;
  parameters: ReadonlyArray<JavaLambdaParameter>;
}

export function createLambdaExpression(
  parameters: ReadonlyArray<JavaLambdaParameter>,
  body: ReadonlyArray<JavaStatement> | JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaLambdaExpression {
  return {
    body: body instanceof Array ? createBlock(body) : body,
    kind: JavaNodeKind.LambdaExpression,
    leadingComments,
    parameters,
    trailingComments,
  };
}
