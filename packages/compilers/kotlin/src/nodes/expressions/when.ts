import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinWhenEntry } from "../shared.js";

export interface KotlinWhenExpression extends KotlinNodeBase {
  entries: ReadonlyArray<KotlinWhenEntry>;
  kind: KotlinNodeKind.WhenExpression;
  subject?: KotlinExpression;
}

export function createWhenExpression(
  entries: ReadonlyArray<KotlinWhenEntry>,
  subject?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinWhenExpression {
  return {
    entries,
    kind: KotlinNodeKind.WhenExpression,
    leadingComments,
    subject,
    trailingComments,
  };
}
