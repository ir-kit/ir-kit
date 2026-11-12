import type { JavaNodeBase } from "../base.js";
import type { JavaExpression } from "../expression.js";
import { JavaNodeKind } from "../kinds.js";
import type { JavaStatement } from "../statement.js";
import { createBlock, type JavaBlock } from "./block.js";

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
