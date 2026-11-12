import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinNavigationExpression extends KotlinNodeBase {
  kind: KotlinNodeKind.NavigationExpression;
  receiver: KotlinExpression;
  safe?: boolean;
  selector: KotlinExpression;
}

export function createNavigationExpression(
  receiver: KotlinExpression,
  selector: KotlinExpression,
  safe?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinNavigationExpression {
  return {
    kind: KotlinNodeKind.NavigationExpression,
    leadingComments,
    receiver,
    safe,
    selector,
    trailingComments,
  };
}
