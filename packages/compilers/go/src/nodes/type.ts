import type { GoIdentifier } from "./expressions/identifier.js";
import type { GoArrayType } from "./types/array-type.js";
import type { GoChannelType } from "./types/channel-type.js";
import type { GoFunctionType } from "./types/function-type.js";
import type { GoGenericType } from "./types/generic-type.js";
import type { GoInterfaceType } from "./types/interface-type.js";
import type { GoMapType } from "./types/map-type.js";
import type { GoPointerType } from "./types/pointer-type.js";
import type { GoStructType } from "./types/struct-type.js";
import type { GoTypeSet } from "./types/type-set.js";

export type GoType =
  | GoArrayType
  | GoChannelType
  | GoFunctionType
  | GoGenericType
  | GoIdentifier
  | GoInterfaceType
  | GoMapType
  | GoPointerType
  | GoStructType
  | GoTypeSet;
