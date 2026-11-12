import type { KotlinNodeBase } from "../base.js";
import type { KotlinExpression } from "../expression.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinCallableReference extends KotlinNodeBase {
  kind: KotlinNodeKind.CallableReference;
  name: string;
  receiver?: KotlinExpression;
}

export function createCallableReference(
  name: string,
  receiver?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinCallableReference {
  return {
    kind: KotlinNodeKind.CallableReference,
    leadingComments,
    name,
    receiver,
    trailingComments,
  };
}
