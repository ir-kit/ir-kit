import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinModifier } from '../shared';
import type { KotlinType } from '../type';
import type { KotlinTypeParameter } from '../types/type-parameter';
import type { KotlinAnnotation } from './annotation';

export interface KotlinTypeAlias extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  kind: KotlinNodeKind.TypeAlias;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name: string;
  type: KotlinType;
  typeParameters?: ReadonlyArray<KotlinTypeParameter>;
}

export function createTypeAlias(
  name: string,
  type: KotlinType,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  typeParameters?: ReadonlyArray<KotlinTypeParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinTypeAlias {
  return {
    annotations,
    kind: KotlinNodeKind.TypeAlias,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
    typeParameters,
  };
}
