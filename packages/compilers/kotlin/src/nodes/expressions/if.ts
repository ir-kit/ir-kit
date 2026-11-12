import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinIfExpression extends KotlinNodeBase {
  condition: KotlinExpression;
  elseBranch?: KotlinExpression;
  kind: KotlinNodeKind.IfExpression;
  thenBranch: KotlinExpression;
}

export function createIfExpression(
  condition: KotlinExpression,
  thenBranch: KotlinExpression,
  elseBranch?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinIfExpression {
  return {
    condition,
    elseBranch,
    kind: KotlinNodeKind.IfExpression,
    leadingComments,
    thenBranch,
    trailingComments,
  };
}
