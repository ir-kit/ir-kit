import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinModifier, KotlinPropertyAccessor, KotlinValOrVar } from '../shared';
import type { KotlinType } from '../type';
import type { KotlinAnnotation } from './annotation';

export interface KotlinProperty extends KotlinNodeBase {
  accessors?: ReadonlyArray<KotlinPropertyAccessor>;
  annotations?: ReadonlyArray<KotlinAnnotation>;
  delegate?: KotlinExpression;
  initializer?: KotlinExpression;
  kind: KotlinNodeKind.Property;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name: string;
  type?: KotlinType;
  valOrVar: KotlinValOrVar;
}

export function createProperty(
  name: string,
  valOrVar: KotlinValOrVar,
  type?: KotlinType,
  initializer?: KotlinExpression,
  accessors?: ReadonlyArray<KotlinPropertyAccessor>,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  delegate?: KotlinExpression,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinProperty {
  return {
    accessors,
    annotations,
    delegate,
    initializer,
    kind: KotlinNodeKind.Property,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
    valOrVar,
  };
}
