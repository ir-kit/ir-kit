import type { KotlinFunctionType } from "./types/function-type.js";
import type { KotlinNullableType } from "./types/nullable-type.js";
import type { KotlinStarProjection } from "./types/star-projection.js";
import type { KotlinTypeProjection } from "./types/type-projection.js";
import type { KotlinUserType } from "./types/user-type.js";

export type KotlinType =
  | KotlinFunctionType
  | KotlinNullableType
  | KotlinStarProjection
  | KotlinTypeProjection
  | KotlinUserType;
