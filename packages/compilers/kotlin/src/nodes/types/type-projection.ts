import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinType } from '../type';

export interface KotlinTypeProjection extends KotlinNodeBase {
  kind: KotlinNodeKind.TypeProjection;
  type: KotlinType;
  variance: 'in' | 'out';
}

export function createTypeProjection(
  variance: 'in' | 'out',
  type: KotlinType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinTypeProjection {
  return {
    kind: KotlinNodeKind.TypeProjection,
    leadingComments,
    trailingComments,
    type,
    variance,
  };
}
