import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export interface GoAssignment extends GoNodeBase {
  kind: GoNodeKind.Assignment;
  targets: ReadonlyArray<GoExpression>;
  values: ReadonlyArray<GoExpression>;
}

export function createAssignment(
  targets: ReadonlyArray<GoExpression>,
  values: ReadonlyArray<GoExpression>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoAssignment {
  return {
    kind: GoNodeKind.Assignment,
    leadingComments,
    targets,
    trailingComments,
    values,
  };
}
