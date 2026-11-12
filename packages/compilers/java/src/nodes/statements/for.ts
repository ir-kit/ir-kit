import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

export interface JavaForStatement extends JavaNodeBase {
  body: JavaBlock;
  condition?: JavaExpression;
  init?: JavaStatement;
  iterable?: JavaExpression;
  kind: JavaNodeKind.ForStatement;
  type?: JavaExpression;
  update?: JavaStatement;
  // Enhanced-for variant fields; if present, print as foreach
  variable?: string;
}

export function createForStatement(
  init: JavaStatement | undefined,
  condition: JavaExpression | undefined,
  update: JavaStatement | undefined,
  body: ReadonlyArray<JavaStatement>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaForStatement {
  return {
    body: createBlock(body),
    condition,
    init,
    kind: JavaNodeKind.ForStatement,
    leadingComments,
    trailingComments,
    update,
  };
}

export function createEnhancedForStatement(
  variable: string,
  iterable: JavaExpression,
  body: ReadonlyArray<JavaStatement>,
  type?: JavaExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): JavaForStatement {
  return {
    body: createBlock(body),
    iterable,
    kind: JavaNodeKind.ForStatement,
    leadingComments,
    trailingComments,
    type,
    variable,
  };
}
