import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";

export interface JavaAssignment extends JavaNodeBase {
  kind: JavaNodeKind.Assignment;
  target: JavaExpression;
  value: JavaExpression;
}

export type JavaAugmentedAssignmentOperator =
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "&="
  | "|="
  | "^="
  | "<<="
  | ">>="
  | ">>>=";

export interface JavaAugmentedAssignment extends JavaNodeBase {
  kind: JavaNodeKind.AugmentedAssignment;
  operator: JavaAugmentedAssignmentOperator;
  target: JavaExpression;
  value: JavaExpression;
}

export function createAssignment(
  target: JavaExpression,
  value: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaAssignment {
  return {
    kind: JavaNodeKind.Assignment,
    leadingComments,
    target,
    trailingComments,
    value,
  };
}

export function createAugmentedAssignment(
  target: JavaExpression,
  operator: JavaAugmentedAssignmentOperator,
  value: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaAugmentedAssignment {
  return {
    kind: JavaNodeKind.AugmentedAssignment,
    leadingComments,
    operator,
    target,
    trailingComments,
    value,
  };
}
