import type { KotlinNodeBase } from '../base';
import type { KotlinDeclaration } from '../declaration';
import { KotlinNodeKind } from '../kinds';
import type { KotlinModifier, KotlinSuperType } from '../shared';
import type { KotlinTypeParameter } from '../types/type-parameter';
import type { KotlinAnnotation } from './annotation';
import type { KotlinEnumEntry } from './enum-entry';
import type { KotlinPrimaryConstructor } from './primary-constructor';

export interface KotlinClassDeclaration extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  entries?: ReadonlyArray<KotlinEnumEntry>;
  isInterface?: boolean;
  kind: KotlinNodeKind.ClassDeclaration;
  members?: ReadonlyArray<KotlinDeclaration>;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name: string;
  primaryConstructor?: KotlinPrimaryConstructor;
  superTypes?: ReadonlyArray<KotlinSuperType>;
  typeParameters?: ReadonlyArray<KotlinTypeParameter>;
}

export function createClassDeclaration(
  name: string,
  primaryConstructor?: KotlinPrimaryConstructor,
  members?: ReadonlyArray<KotlinDeclaration>,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  superTypes?: ReadonlyArray<KotlinSuperType>,
  entries?: ReadonlyArray<KotlinEnumEntry>,
  isInterface?: boolean,
  typeParameters?: ReadonlyArray<KotlinTypeParameter>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinClassDeclaration {
  return {
    annotations,
    entries,
    isInterface,
    kind: KotlinNodeKind.ClassDeclaration,
    leadingComments,
    members,
    modifiers,
    name,
    primaryConstructor,
    superTypes,
    trailingComments,
    typeParameters,
  };
}
