import type { GoNodeBase } from '../base';
import type { GoExpression } from '../expression';
import { GoNodeKind } from '../kinds';
import type { GoType } from '../type';

export interface GoCallExpression extends GoNodeBase {
  args: ReadonlyArray<GoExpression | GoType>;
  callee: GoExpression;
  kind: GoNodeKind.CallExpression;
  spreadLastArg?: boolean;
}

export function createCallExpression(
  callee: GoExpression,
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
