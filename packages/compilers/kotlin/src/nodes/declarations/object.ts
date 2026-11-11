import type { KotlinNodeBase } from "../base.js";
import type { KotlinDeclaration } from "../declaration.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinModifier, KotlinSuperType } from "../shared.js";
import type { KotlinAnnotation } from "./annotation.js";

export interface KotlinObjectDeclaration extends KotlinNodeBase {
  annotations?: ReadonlyArray<KotlinAnnotation>;
  isCompanion?: boolean;
  kind: KotlinNodeKind.ObjectDeclaration;
  members?: ReadonlyArray<KotlinDeclaration>;
  modifiers?: ReadonlyArray<KotlinModifier>;
  name?: string;
  superTypes?: ReadonlyArray<KotlinSuperType>;
}

export function createObjectDeclaration(
  name?: string,
  members?: ReadonlyArray<KotlinDeclaration>,
  modifiers?: ReadonlyArray<KotlinModifier>,
  annotations?: ReadonlyArray<KotlinAnnotation>,
  superTypes?: ReadonlyArray<KotlinSuperType>,
  isCompanion?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinObjectDeclaration {
  return {
    annotations,
    isCompanion,
    kind: KotlinNodeKind.ObjectDeclaration,
    leadingComments,
    members,
    modifiers,
    name,
    superTypes,
    trailingComments,
  };
}
