import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinType } from "../type.js";

export interface KotlinUserType extends KotlinNodeBase {
  kind: KotlinNodeKind.UserType;
  name: string;
  typeArguments?: ReadonlyArray<KotlinType>;
}

export function createUserType(
  name: string,
  typeArguments?: ReadonlyArray<KotlinType>,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinUserType {
  return {
    kind: KotlinNodeKind.UserType,
    leadingComments,
    name,
    trailingComments,
    typeArguments,
  };
}
