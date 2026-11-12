import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";
import type { GoStatement } from "../statement.js";
import { createBlock, type GoBlock } from "./block.js";

export interface GoForRangeStatement extends GoNodeBase {
  body: GoBlock;
  iterable: GoExpression;
  kind: GoNodeKind.ForRangeStatement;
  targets?: ReadonlyArray<string>;
  useShortVar?: boolean;
}

export function createForRangeStatement(
  iterable: GoExpression,
  body: ReadonlyArray<GoStatement>,
  targets?: ReadonlyArray<string>,
  useShortVar: boolean = true,
): GoForRangeStatement {
  return {
    body: createBlock(body),
    iterable,
    kind: GoNodeKind.ForRangeStatement,
    targets,
    useShortVar,
  };
}
