import type { JavaNodeBase } from '../base';
import type { JavaExpression } from '../expression';
import { JavaNodeKind } from '../kinds';
import type { JavaStatement } from '../statement';
import { createBlock, type JavaBlock } from './block';

export interface JavaDoWhileStatement extends JavaNodeBase {
  body: JavaBlock;
  condition: JavaExpression;
  kind: JavaNodeKind.DoWhileStatement;
}

export function createDoWhileStatement(
  body: ReadonlyArray<JavaStatement>,
  condition: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaDoWhileStatement {
  return {
    body: createBlock(body),
    condition,
    kind: JavaNodeKind.DoWhileStatement,
    leadingComments,
    trailingComments,
  };
}
