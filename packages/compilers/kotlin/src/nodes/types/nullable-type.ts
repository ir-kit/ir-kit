import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinType } from "../type.js";

export interface KotlinNullableType extends KotlinNodeBase {
  kind: KotlinNodeKind.NullableType;
  type: KotlinType;
}

export function createNullableType(
  type: KotlinType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinNullableType {
  return {
    kind: KotlinNodeKind.NullableType,
    leadingComments,
    trailingComments,
    type,
  };
}
