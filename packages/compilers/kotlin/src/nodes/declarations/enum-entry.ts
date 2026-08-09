import type { KotlinNodeBase } from '../base';
import type { KotlinDeclaration } from '../declaration';
import { KotlinNodeKind } from '../kinds';
import type { KotlinValueArgument } from '../shared';
import type { KotlinAnnotation } from './annotation';

export interface KotlinEnumEntry extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  kind: KotlinNodeKind.EnumEntry;
  members?: ReadonlyArray<KotlinDeclaration>;
  name: string;
  valueArguments?: ReadonlyArray<KotlinValueArgument>;
}

export function createEnumEntry(
  name: string,
  valueArguments?: ReadonlyArray<KotlinValueArgument>,
  members?: ReadonlyArray<KotlinDeclaration>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinEnumEntry {
  return {
    annotations,
    kind: KotlinNodeKind.EnumEntry,
    leadingComments,
    members,
    name,
    trailingComments,
    valueArguments,
  };
}
