import type { KotlinNodeBase } from '../base';
import { KotlinNodeKind } from '../kinds';
import type { KotlinModifier } from '../shared';
import type { KotlinAnnotation } from './annotation';
import type { KotlinParameter } from './parameter';

export interface KotlinPrimaryConstructor extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  kind: KotlinNodeKind.PrimaryConstructor;
  modifiers?: ReadonlyArray<KotlinModifier>;
  parameters: ReadonlyArray<KotlinParameter>;
}

export function createPrimaryConstructor(
  parameters: ReadonlyArray<KotlinParameter>,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinPrimaryConstructor {
  return {
    annotations,
    kind: KotlinNodeKind.PrimaryConstructor,
    leadingComments,
    modifiers,
    parameters,
    trailingComments,
  };
}
