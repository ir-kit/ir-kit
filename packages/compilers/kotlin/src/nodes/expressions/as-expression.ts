import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinType } from "../type.js";

export interface KotlinAsExpression extends KotlinNodeBase {
  expression: KotlinExpression;
  kind: KotlinNodeKind.AsExpression;
  safe?: boolean;
  type: KotlinType;
}

export function createAsExpression(
  expression: KotlinExpression,
  type: KotlinType,
  safe?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinAsExpression {
  return {
    expression,
    kind: KotlinNodeKind.AsExpression,
    leadingComments,
    safe,
    trailingComments,
    type,
  };
}
