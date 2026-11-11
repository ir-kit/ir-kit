import type { GoNodeBase } from "../base.js";
import type { GoExpression } from "../expression.js";
import { GoNodeKind } from "../kinds.js";

export interface GoSendStatement extends GoNodeBase {
  channel: GoExpression;
  kind: GoNodeKind.SendStatement;
  value: GoExpression;
}

export function createSendStatement(
  channel: GoExpression,
  value: GoExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): GoSendStatement {
  return {
    channel,
    kind: GoNodeKind.SendStatement,
    leadingComments,
    trailingComments,
    value,
  };
}
