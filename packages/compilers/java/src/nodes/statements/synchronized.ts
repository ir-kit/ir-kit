import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from './block';

export interface JavaSynchronizedStatement extends JavaNodeBase {
  body: JavaBlock;
  kind: JavaNodeKind.SynchronizedStatement;
  monitor: JavaExpression;
}

export function createSynchronizedStatement(
  monitor: JavaExpression,
  body: ReadonlyArray<JavaStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaSynchronizedStatement {
  return {
    body: createBlock(body),
    kind: JavaNodeKind.SynchronizedStatement,
    leadingComments,
    monitor,
    trailingComments,
  };
}
