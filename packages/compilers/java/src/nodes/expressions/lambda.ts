import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "../statements/block.js";

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
