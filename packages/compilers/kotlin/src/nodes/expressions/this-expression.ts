import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinThisExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.ThisExpression;
  label?: string;
}

export function createThisExpression(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinThisExpression {
  return {
    kind: KotlinNodeKind.ThisExpression,
    label,
    leadingComments,
    trailingComments,
  };
}
