import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

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
