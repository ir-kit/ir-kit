import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinType } from '../type';

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
