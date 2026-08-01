import type { KotlinAnnotation } from './declarations/annotation';
import type { KotlinClassDeclaration } from './declarations/class';
import type { KotlinEnumEntry } from './declarations/enum-entry';
import type { KotlinFunctionDeclaration } from './declarations/function';
import type { KotlinInitBlock } from './declarations/init-block';
import type { KotlinObjectDeclaration } from './declarations/object';
import type { KotlinParameter } from './declarations/parameter';
import type { KotlinPrimaryConstructor } from './declarations/primary-constructor';
import type { KotlinProperty } from './declarations/property';
import type { KotlinTypeAlias } from './declarations/type-alias';

export type KotlinDeclaration =
  | KotlinAnnotation
  | KotlinClassDeclaration
  | KotlinEnumEntry
  | KotlinFunctionDeclaration
  | KotlinInitBlock
  | KotlinObjectDeclaration
  | KotlinParameter
  | KotlinPrimaryConstructor
  | KotlinProperty
  | KotlinTypeAlias;
