import type { GoIdentifier } from './expressions/identifier';
import type { GoArrayType } from './types/array-type';
import type { GoChannelType } from './types/channel-type';
import type { GoFunctionType } from './types/function-type';
import type { GoGenericType } from './types/generic-type';
import type { GoInterfaceType } from './types/interface-type';
import type { GoMapType } from './types/map-type';
import type { GoPointerType } from './types/pointer-type';
import type { GoStructType } from './types/struct-type';
import type { GoTypeSet } from './types/type-set';

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
