import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "../statements/block.js";

export interface JavaSwitchRule {
  body: JavaBlock | JavaExpression;
  expressions?: ReadonlyArray<JavaExpression>;
}

export interface JavaSwitchExpression extends JavaNodeBase {
  discriminant: JavaExpression;
  kind: JavaNodeKind.SwitchExpression;
  rules: ReadonlyArray<JavaSwitchRule>;
}

export function createSwitchRule(
  expressions: ReadonlyArray<JavaExpression> | undefined,
  body: ReadonlyArray<JavaStatement> | JavaExpression,
): JavaSwitchRule {
  return {
    body: body instanceof Array ? createBlock(body) : body,
    expressions,
  };
}

export function createSwitchExpression(
  discriminant: JavaExpression,
  rules: ReadonlyArray<JavaSwitchRule>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaSwitchExpression {
  return {
    discriminant,
    kind: JavaNodeKind.SwitchExpression,
    leadingComments,
    rules,
    trailingComments,
  };
}
