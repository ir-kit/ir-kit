import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import type { JavaBlock } from "../statements/block.js";
import { createBlock } from "../statements/block.js";

export interface JavaNewExpression extends JavaNodeBase {
  args: ReadonlyArray<JavaExpression>;
  body?: JavaBlock;
  callee: JavaExpression;
  kind: JavaNodeKind.NewExpression;
}

export function createNewExpression(
  callee: JavaExpression,
  args?: ReadonlyArray<JavaExpression>,
  bodyMembers?: ReadonlyArray<JavaStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaNewExpression {
  return {
    args: args ?? [],
    body: bodyMembers ? createBlock(bodyMembers) : undefined,
    callee,
    kind: JavaNodeKind.NewExpression,
    leadingComments,
    trailingComments,
  };
}
export function createNewAnonymousClassExpression(
  callee: JavaExpression,
  args: ReadonlyArray<JavaExpression> = [],
  members: ReadonlyArray<JavaStatement> = [],
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaNewExpression {
  return createNewExpression(
    callee,
    args,
    members,
    leadingComments,
    trailingComments,
  );
}
