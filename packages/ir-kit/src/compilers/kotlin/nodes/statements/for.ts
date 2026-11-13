import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinStatement } from "../statement.js";

export interface KotlinForStatement extends KotlinNodeBase {
  body: KotlinStatement;
  iterable: KotlinExpression;
  kind: KotlinNodeKind.ForStatement;
  variables: ReadonlyArray<string>;
}

export function createForStatement(
  variables: ReadonlyArray<string>,
  iterable: KotlinExpression,
  body: KotlinStatement,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinForStatement {
  return {
    body,
    iterable,
    kind: KotlinNodeKind.ForStatement,
    leadingComments,
    trailingComments,
    variables,
  };
}
