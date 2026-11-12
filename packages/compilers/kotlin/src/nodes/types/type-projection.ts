import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";
import type { KotlinType } from "../type.js";

export interface KotlinTypeProjection extends KotlinNodeBase {
  kind: KotlinNodeKind.TypeProjection;
  type: KotlinType;
  variance: "in" | "out";
}

export function createTypeProjection(
  variance: "in" | "out",
  type: KotlinType,
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinTypeProjection {
  return {
    kind: KotlinNodeKind.TypeProjection,
    leadingComments,
    trailingComments,
    type,
    variance,
  };
}
