import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from '../statements/block';

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
