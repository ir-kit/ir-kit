import type { KotlinFunctionType } from './types/function-type';
import type { KotlinNullableType } from './types/nullable-type';
import type { KotlinStarProjection } from './types/star-projection';
import type { KotlinTypeProjection } from './types/type-projection';
import type { KotlinUserType } from './types/user-type';

export type KotlinType =
  | KotlinFunctionType
  | KotlinNullableType
  | KotlinStarProjection
  | KotlinTypeProjection
  | KotlinUserType;
