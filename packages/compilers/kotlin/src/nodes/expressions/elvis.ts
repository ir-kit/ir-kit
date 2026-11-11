import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinElvisExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.ElvisExpression;
  left: KotlinExpression;
  right: KotlinExpression;
}

export function createElvisExpression(
  left: KotlinExpression,
  right: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinElvisExpression {
  return {
    kind: KotlinNodeKind.ElvisExpression,
    leadingComments,
    left,
    right,
    trailingComments,
  };
}
