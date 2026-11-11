import type { KotlinNodeBase } from "../base.js";
import { KotlinNodeKind } from "../kinds.js";

export interface KotlinStarProjection extends KotlinNodeBase {
  kind: KotlinNodeKind.StarProjection;
}

export function createStarProjection(
  leadingComments?: ReadonlyArray<string>,
  trailingComments?: ReadonlyArray<string>,
): KotlinStarProjection {
  return {
    kind: KotlinNodeKind.StarProjection,
    leadingComments,
    trailingComments,
  };
}
