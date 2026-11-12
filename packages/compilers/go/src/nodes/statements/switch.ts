import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import { createBlock, type GoBlock } from "./block.js";

export interface GoSwitchCase {
  body: GoBlock;
  expressions?: ReadonlyArray<GoExpression>;
}

export interface GoTypeSwitchGuard {
  assignTo?: string;
  subject: GoExpression;
}

export interface GoSwitchStatement extends GoNodeBase {
  cases: ReadonlyArray<GoSwitchCase>;
  initStatement?: GoStatement;
  kind: GoNodeKind.SwitchStatement;
  tag?: GoExpression;
  typeGuard?: GoTypeSwitchGuard;
}

export function createSwitchCase(
  body: ReadonlyArray<GoStatement>,
  expressions?: ReadonlyArray<GoExpression>,
): GoSwitchCase {
  return {
    body: createBlock(body),
    expressions,
  };
}

export function createSwitchStatement(
  cases: ReadonlyArray<GoSwitchCase>,
  tag?: GoExpression,
  initStatement?: GoStatement,
  typeGuard?: GoTypeSwitchGuard,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoSwitchStatement {
  return {
    cases,
    initStatement,
    kind: GoNodeKind.SwitchStatement,
    leadingComments,
    tag,
    trailingComments,
    typeGuard,
  };
}

export interface GoFallthroughStatement extends GoNodeBase {
  kind: GoNodeKind.FallthroughStatement;
}

export function createFallthroughStatement(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoFallthroughStatement {
  return {
    kind: GoNodeKind.FallthroughStatement,
    leadingComments,
    trailingComments,
  };
}
