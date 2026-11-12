import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinThrowStatement extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.ThrowStatement;
}

export function createThrowStatement(
  expression: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinThrowStatement {
  return {
    expression,
    kind: KotlinNodeKind.ThrowStatement,
    leadingComments,
    trailingComments,
  };
}
