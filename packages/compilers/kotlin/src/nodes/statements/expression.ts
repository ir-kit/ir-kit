import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinExpressionStatement extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.ExpressionStatement;
}

export function createExpressionStatement(
  expression: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinExpressionStatement {
  return {
    expression,
    kind: KotlinNodeKind.ExpressionStatement,
    leadingComments,
    trailingComments,
  };
}
