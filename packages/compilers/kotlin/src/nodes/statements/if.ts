import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinStatement } from "../statement.js";

export interface KotlinIfStatement extends KotlinNodeBase {
  condition: KotlinExpression;
  elseBranch?: KotlinStatement;
  kind: KotlinNodeKind.IfStatement;
  thenBranch: KotlinStatement;
}

export function createIfStatement(
  condition: KotlinExpression,
  thenBranch: KotlinStatement,
  elseBranch?: KotlinStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinIfStatement {
  return {
    condition,
    elseBranch,
    kind: KotlinNodeKind.IfStatement,
    leadingComments,
    thenBranch,
    trailingComments,
  };
}
