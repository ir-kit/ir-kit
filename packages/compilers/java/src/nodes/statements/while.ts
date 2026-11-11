import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from './block';

export interface JavaWhileStatement extends JavaNodeBase {
  body: JavaBlock;
  condition: JavaExpression;
  kind: JavaNodeKind.WhileStatement;
}

export function createWhileStatement(
  condition: JavaExpression,
  body: ReadonlyArray<JavaStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaWhileStatement {
  return {
    body: createBlock(body),
    condition,
    kind: JavaNodeKind.WhileStatement,
    leadingComments,
    trailingComments,
  };
}
