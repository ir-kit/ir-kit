import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinType } from "../type.js";

export interface KotlinTypeParameter extends KotlinNodeBase {
  bounds?: ReadonlyArray<KotlinType>;
  isReified?: boolean;
  kind: KotlinNodeKind.TypeParameter;
  name: string;
  variance?: "in" | "out";
}

export function createTypeParameter(
  name: string,
  bounds?: ReadonlyArray<KotlinType>,
  variance?: "in" | "out",
  isReified?: boolean,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinTypeParameter {
  return {
    bounds,
    isReified,
    kind: KotlinNodeKind.TypeParameter,
    leadingComments,
    name,
    trailingComments,
    variance,
  };
}
