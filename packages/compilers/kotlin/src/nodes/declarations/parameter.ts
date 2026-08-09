import type { KotlinNodeBase } from '../base';
import type { KotlinExpression } from '../expression';
import { KotlinNodeKind } from '../kinds';
import type { KotlinModifier, KotlinValOrVar } from '../shared';
import type { KotlinType } from '../type';
import type { KotlinAnnotation } from './annotation';

export interface KotlinParameter extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  defaultValue?: KotlinExpression;
  kind: KotlinNodeKind.Parameter;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name: string;
  type: KotlinType;
  valOrVar?: KotlinValOrVar;
}

export function createParameter(
  name: string,
  type: KotlinType,
  defaultValue?: KotlinExpression,
  valOrVar?: KotlinValOrVar,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinParameter {
  return {
    annotations,
    defaultValue,
    kind: KotlinNodeKind.Parameter,
    leadingComments,
    modifiers,
    name,
    trailingComments,
    type,
    valOrVar,
  };
}
