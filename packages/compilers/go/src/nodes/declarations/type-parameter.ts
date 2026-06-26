import type { GoType } from '../type';

export type GoTypeParameter = {
  constraint: GoType;
  names: ReadonlyArray<string>;
};
