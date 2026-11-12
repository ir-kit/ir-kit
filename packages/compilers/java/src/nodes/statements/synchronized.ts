import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

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
