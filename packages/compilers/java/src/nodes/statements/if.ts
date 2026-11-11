import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

export interface JavaIfStatement extends JavaNodeBase {
  condition: JavaExpression;
  elseBlock?: JavaBlock | JavaIfStatement;
  kind: JavaNodeKind.IfStatement;
  thenBlock: JavaBlock;
}

export function createIfStatement(
  condition: JavaExpression,
  thenBlock: ReadonlyArray<JavaStatement>,
  elseBlock?: ReadonlyArray<JavaStatement> | JavaIfStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaIfStatement {
  return {
    condition,
    elseBlock: elseBlock instanceof Array ? createBlock(elseBlock) : elseBlock,
    kind: JavaNodeKind.IfStatement,
    leadingComments,
    thenBlock: createBlock(thenBlock),
    trailingComments,
  };
}
