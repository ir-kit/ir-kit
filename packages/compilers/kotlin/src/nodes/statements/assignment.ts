import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinAssignmentOperator } from "../shared.js";

export interface KotlinAssignment extends KotlinNodeBase {
  kind: KotlinNodeKind.Assignment;
  operator?: KotlinAssignmentOperator;
  target: KotlinExpression;
  value: KotlinExpression;
}

export function createAssignment(
  target: KotlinExpression,
  value: KotlinExpression,
  operator?: KotlinAssignmentOperator,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinAssignment {
  return {
    kind: KotlinNodeKind.Assignment,
    leadingComments,
    operator,
    target,
    trailingComments,
    value,
  };
}
