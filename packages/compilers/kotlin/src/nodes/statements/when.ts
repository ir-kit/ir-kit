import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinWhenEntry } from "../shared.js";

export interface KotlinWhenStatement extends KotlinNodeBase {
  entries: ReadonlyArray<KotlinWhenEntry>;
  kind: KotlinNodeKind.WhenStatement;
  subject?: KotlinExpression;
}

export function createWhenStatement(
  entries: ReadonlyArray<KotlinWhenEntry>,
  subject?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinWhenStatement {
  return {
    entries,
    kind: KotlinNodeKind.WhenStatement,
    leadingComments,
    subject,
    trailingComments,
  };
}
