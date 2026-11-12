import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoType } from "../type.js";

export interface GoCallExpression extends GoNodeBase {
  args: ReadonlyArray<GoExpression | GoType>;
  callee: GoExpression | GoType;
  kind: GoNodeKind.CallExpression;
  spreadLastArg?: boolean;
}

export function createCallExpression(
  callee: GoExpression | GoType,
  args?: ReadonlyArray<GoExpression | GoType>,
  spreadLastArg?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoCallExpression {
  return {
    args: args ?? [],
    callee,
    kind: GoNodeKind.CallExpression,
    leadingComments,
    spreadLastArg,
    trailingComments,
  };
}
