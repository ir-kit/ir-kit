import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from './block';

export interface JavaSwitchCase {
  body: JavaBlock;
  expressions?: ReadonlyArray<JavaExpression>;
}

export interface JavaSwitchStatement extends JavaNodeBase {
  cases: ReadonlyArray<JavaSwitchCase>;
  discriminant: JavaExpression;
  kind: JavaNodeKind.SwitchStatement;
}

export function createSwitchStatement(
  discriminant: JavaExpression,
  cases: ReadonlyArray<JavaSwitchCase>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaSwitchStatement {
  return {
    cases,
    discriminant,
    kind: JavaNodeKind.SwitchStatement,
    leadingComments,
    trailingComments,
  };
}

export function createSwitchCase(
  expressions: ReadonlyArray<JavaExpression> | undefined,
  body: ReadonlyArray<JavaStatement>,
): JavaSwitchCase {
  return {
    body: createBlock(body),
    expressions,
  };
}
