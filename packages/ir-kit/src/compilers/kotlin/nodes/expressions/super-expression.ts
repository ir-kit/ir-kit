import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinSuperExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.SuperExpression;
  label?: string;
}

export function createSuperExpression(
  label?: string,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinSuperExpression {
  return {
    kind: KotlinNodeKind.SuperExpression,
    label,
    leadingComments,
    trailingComments,
  };
}
