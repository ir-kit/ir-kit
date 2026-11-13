import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

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
