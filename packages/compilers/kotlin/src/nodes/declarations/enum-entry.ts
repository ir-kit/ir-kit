import type { KotlinNodeBase } from "../base.js";
import type { KotlinDeclaration } from "../declaration.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinValueArgument } from "../shared.js";
import type { KotlinAnnotation } from "./annotation.js";

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
