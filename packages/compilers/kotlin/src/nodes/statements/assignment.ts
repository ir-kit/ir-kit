import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinAssignmentOperator } from '../shared';

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
