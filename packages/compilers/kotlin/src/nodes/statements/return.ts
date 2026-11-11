import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinReturnStatement extends KotlinNodeBase {
  expression?: KotlinExpression;
  kind: KotlinNodeKind.ReturnStatement;
  label?: string;
}

export function createReturnStatement(
  expression?: KotlinExpression,
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinReturnStatement {
  return {
    expression,
    kind: KotlinNodeKind.ReturnStatement,
    label,
    leadingComments,
    trailingComments,
  };
}
