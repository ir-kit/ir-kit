import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinStatement } from "../statement.js";

export interface KotlinWhileStatement extends KotlinNodeBase {
  body: KotlinStatement;
  condition: KotlinExpression;
  isDoWhile?: boolean;
  kind: KotlinNodeKind.WhileStatement;
}

export function createWhileStatement(
  condition: KotlinExpression,
  body: KotlinStatement,
  isDoWhile?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinWhileStatement {
  return {
    body,
    condition,
    isDoWhile,
    kind: KotlinNodeKind.WhileStatement,
    leadingComments,
    trailingComments,
  };
}
